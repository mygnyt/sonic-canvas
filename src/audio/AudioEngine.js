// Web Audio API engine for SonicCanvas
// Features: Polyphonic synthesis, custom scales, delay, algorithmic reverb, master filter, analyzer & audio recording

export const SCALES = {
  pentatonic_major: { name: 'Pentatonic Major (Uplifting)', intervals: [0, 2, 4, 7, 9] },
  pentatonic_minor: { name: 'Pentatonic Minor (Melancholic)', intervals: [0, 3, 5, 7, 10] },
  hirajoshi: { name: 'Hirajoshi (Zen / Japanese)', intervals: [0, 2, 3, 7, 8] },
  dorian: { name: 'Dorian (Neo-Soul / Jazz)', intervals: [0, 2, 3, 5, 7, 9, 10] },
  phrygian: { name: 'Phrygian (Cyberpunk / Dark)', intervals: [0, 1, 3, 5, 7, 8, 10] },
  lydian: { name: 'Lydian (Dreamy / Celestial)', intervals: [0, 2, 4, 6, 7, 9, 11] },
  blues: { name: 'Blues (Groovy)', intervals: [0, 3, 5, 6, 7, 10] },
  chromatic: { name: 'Chromatic (All 12 Notes)', intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
};

export const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SYNTH_TYPES = {
  bell: 'Crystal Chime',
  marimba: 'Wooden Marimba',
  cyber: 'Cyberpunk Saw',
  ambient: 'Celestial Sine',
  '8bit': 'Retro 8-Bit',
  pluck: 'Laser Harp Pluck',
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.delayGain = null;
    this.reverbNode = null;
    this.reverbGain = null;
    this.filterNode = null;
    this.recordDest = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;

    // Default Configuration
    this.currentScale = 'hirajoshi';
    this.rootNote = 'C';
    this.baseOctave = 3;
    this.synthType = 'bell';
    this.volume = 0.7;
    this.isMuted = false;

    this.settings = {
      reverbWet: 0.35,
      delayWet: 0.3,
      delayTime: 0.28,
      delayFeedback: 0.4,
      filterCutoff: 12000,
    };

    this.activeFrequencies = [];
    this.generateScaleFrequencies();
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    // Master Analyser
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    // Filter Node
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(this.settings.filterCutoff, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Delay FX
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayNode.delayTime.setValueAtTime(this.settings.delayTime, this.ctx.currentTime);
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(this.settings.delayFeedback, this.ctx.currentTime);
    this.delayGain = this.ctx.createGain();
    this.delayGain.gain.setValueAtTime(this.settings.delayWet, this.ctx.currentTime);

    // Loop feedback for delay
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayGain);

    // Reverb FX
    this.reverbNode = this.ctx.createConvolver();
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.setValueAtTime(this.settings.reverbWet, this.ctx.currentTime);
    this.reverbNode.buffer = this.buildImpulseResponse(2.5, 2.0);
    this.reverbNode.connect(this.reverbGain);

    // Routing
    // Synth -> FilterNode -> MasterGain & FX -> Analyser -> Destination
    this.filterNode.connect(this.masterGain);
    this.filterNode.connect(this.delayNode);
    this.filterNode.connect(this.reverbNode);

    this.delayGain.connect(this.masterGain);
    this.reverbGain.connect(this.masterGain);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Recording destination
    try {
      this.recordDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.recordDest);
    } catch {
      console.warn('Recording destination not supported in this browser context');
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  buildImpulseResponse(duration, decay) {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const factor = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return impulse;
  }

  generateScaleFrequencies() {
    const rootIndex = ROOT_NOTES.indexOf(this.rootNote);
    const intervals = SCALES[this.currentScale]?.intervals || SCALES.pentatonic_major.intervals;
    
    // A4 = 440 Hz = MIDI 69
    // C0 is MIDI 12
    const baseMidi = 12 + (this.baseOctave * 12) + rootIndex;
    const frequencies = [];

    // Generate 4 octaves of notes within the scale
    for (let octave = 0; octave < 4; octave++) {
      for (const interval of intervals) {
        const midi = baseMidi + (octave * 12) + interval;
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        frequencies.push(freq);
      }
    }
    this.activeFrequencies = frequencies;
    return frequencies;
  }

  setScale(scaleKey) {
    if (SCALES[scaleKey]) {
      this.currentScale = scaleKey;
      this.generateScaleFrequencies();
    }
  }

  setRootNote(note) {
    if (ROOT_NOTES.includes(note)) {
      this.rootNote = note;
      this.generateScaleFrequencies();
    }
  }

  setSynthType(type) {
    if (SYNTH_TYPES[type]) {
      this.synthType = type;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  setReverbWet(val) {
    this.settings.reverbWet = Math.max(0, Math.min(1, val));
    if (this.reverbGain && this.ctx) {
      this.reverbGain.gain.setTargetAtTime(this.settings.reverbWet, this.ctx.currentTime, 0.05);
    }
  }

  setDelayTime(val) {
    this.settings.delayTime = Math.max(0.05, Math.min(1.0, val));
    if (this.delayNode && this.ctx) {
      this.delayNode.delayTime.setTargetAtTime(this.settings.delayTime, this.ctx.currentTime, 0.05);
    }
  }

  setDelayFeedback(val) {
    this.settings.delayFeedback = Math.max(0, Math.min(0.85, val));
    if (this.delayFeedback && this.ctx) {
      this.delayFeedback.gain.setTargetAtTime(this.settings.delayFeedback, this.ctx.currentTime, 0.05);
    }
  }

  setFilterCutoff(val) {
    this.settings.filterCutoff = Math.max(200, Math.min(20000, val));
    if (this.filterNode && this.ctx) {
      this.filterNode.frequency.setTargetAtTime(this.settings.filterCutoff, this.ctx.currentTime, 0.05);
    }
  }

  getFrequencyByIndex(index) {
    if (this.activeFrequencies.length === 0) this.generateScaleFrequencies();
    const clampedIndex = Math.max(0, Math.min(this.activeFrequencies.length - 1, Math.floor(index)));
    return this.activeFrequencies[clampedIndex];
  }

  // Trigger sound when particle hits node or string
  triggerNote({ index = 0, frequency = null, velocity = 0.8, type = null, pan = 0 }) {
    this.ensureContext();
    if (!this.ctx) return;

    const freq = frequency || this.getFrequencyByIndex(index);
    const synth = type || this.synthType;
    const now = this.ctx.currentTime;
    const gainLevel = Math.max(0.05, Math.min(1.0, velocity)) * 0.45;

    // Stereo panner
    let panner = null;
    if (this.ctx.createStereoPanner) {
      panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      panner.connect(this.filterNode);
    }

    const outputNode = panner || this.filterNode;

    switch (synth) {
      case 'bell':
        this.playBell(freq, gainLevel, now, outputNode);
        break;
      case 'marimba':
        this.playMarimba(freq, gainLevel, now, outputNode);
        break;
      case 'cyber':
        this.playCyberSaw(freq, gainLevel, now, outputNode);
        break;
      case 'ambient':
        this.playAmbient(freq, gainLevel, now, outputNode);
        break;
      case '8bit':
        this.play8Bit(freq, gainLevel, now, outputNode);
        break;
      case 'pluck':
      default:
        this.playPluck(freq, gainLevel, now, outputNode);
        break;
    }
  }

  // Crystal Bell with harmonic overtones
  playBell(freq, velocity, now, target) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Inharmonic bell overtone
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.76, now);

    // Envelope
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(velocity, now + 0.005);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(velocity * 0.35, now + 0.004);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(target);
    gain2.connect(target);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.7);
    osc2.stop(now + 1.7);
  }

  // Marimba: warm acoustic wooden strike
  playMarimba(freq, velocity, now, target) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    // Subtle wooden pitch drop
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.1);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(velocity * 1.2, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(target);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Cyberpunk Synth: Saw wave with dynamic resonant filter bite
  playCyberSaw(freq, velocity, now, target) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(6, now);
    filter.frequency.setValueAtTime(freq * 6, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.4);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(velocity * 0.8, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(target);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  // Celestial Ambient: Dual detuned sine wave with lush sustain
  playAmbient(freq, velocity, now, target) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 1.004, now); // 7 cents detune

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(velocity * 0.7, now + 0.08); // soft attack
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(target);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.3);
    osc2.stop(now + 2.3);
  }

  // Retro 8-Bit Chiptune
  play8Bit(freq, velocity, now, target) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    // Quick pitch chirp
    osc.frequency.setValueAtTime(freq * 1.5, now);
    osc.frequency.setValueAtTime(freq, now + 0.02);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(velocity * 0.5, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(target);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Pluck / Harp
  playPluck(freq, velocity, now, target) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.3);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(velocity, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(target);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  // Portal Teleport Sound Effect
  playWarp(now = null) {
    this.ensureContext();
    if (!this.ctx) return;
    const t = now || this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Live Audio Recording
  startRecording() {
    this.ensureContext();
    if (!this.recordDest) return false;

    try {
      this.recordedChunks = [];
      const stream = this.recordDest.stream;
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(200); // 200ms slice
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      return false;
    }
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.recordedChunks = [];
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  // Get waveform or frequency data for real-time visualizer
  getVisualizerData() {
    if (!this.analyser) return { waveform: new Uint8Array(0), frequency: new Uint8Array(0) };
    const bufferLength = this.analyser.frequencyBinCount;
    const waveform = new Uint8Array(bufferLength);
    const frequency = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(waveform);
    this.analyser.getByteFrequencyData(frequency);
    return { waveform, frequency };
  }
}

export const audioEngine = new AudioEngine();
