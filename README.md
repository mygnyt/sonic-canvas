# 🎵 SonicCanvas — Generative Audio-Visual Playground

[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Polyphonic-a855f7.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

**SonicCanvas** is an interactive generative audio-visual synthesizer and physics sandbox built in the browser. Particles shot from rhythmic cannons collide with tuned resonant chimes, vibrating harmonic laser strings, and gravitational black holes, generating real-time ambient music and polyphonic melodies.

![SonicCanvas Preview](public/preview.png)

---

## ✨ Features

### 🎹 Audio Synthesizer Engine (Web Audio API)
* **6 Polyphonic Synth Voices**:
  * 🔔 *Crystal Chime* — Sine fundamental with harmonic overtones and long decay.
  * 🪵 *Wooden Marimba* — Warm transient attack with acoustic wooden resonance.
  * ⚡ *Cyberpunk Saw* — Aggressive sawtooth through dynamic resonant lowpass sweep.
  * 🌌 *Celestial Sine* — Dual detuned sine waves with soft attack and lush sustain.
  * 👾 *Retro 8-Bit* — Square wave with rapid pitch chirp arpeggio.
  * 🎸 *Laser Harp Pluck* — Triangular resonant string pluck.
* **8 Musical Scales & Tuning**:
  * *Hirajoshi* (Japanese meditative / Zen)
  * *Pentatonic Major* (Uplifting)
  * *Pentatonic Minor* (Melancholic)
  * *Dorian* (Jazz / Neo-Soul)
  * *Phrygian* (Cyberpunk / Dark)
  * *Lydian* (Dreamy / Celestial)
  * *Blues* (Groovy)
  * *Chromatic* (Full 12 semitones)
* **Studio Master Effects Chain**:
  * 🪐 Algorithmic Stereo Reverb (Impulse convolution)
  * 🔁 Ping-Pong Echo Delay (with time & feedback controls)
  * 🎚 Resonant Lowpass Filter with adjustable cutoff
  * 🎧 Real-time Stereo Panning based on horizontal particle collision coordinates!
* **🎙 Live Audio Recording**:
  * Direct browser audio capture (`MediaStreamAudioDestinationNode` + `MediaRecorder`)
  * Download live master recording as `.webm`!

### 🔮 Physics & Canvas Engine (60 FPS)
* **Cannon Emitters**: Rhythmic particle cannons shooting energy spheres at custom BPM intervals.
* **Resonant Bells**: Tuned circular chimes that ring notes and flash glowing shockwaves on impact.
* **Vibrating Laser Strings**: User-drawn elastic strings that deflect particles, plucking pitches proportional to string length!
* **Gravitational Black Holes**: Attractors and pulsars bending particle trajectories into orbital paths.
* **Quantum Warp Portals**: Interconnected pairs of gates teleporting particles with preserved momentum.
* **Radar Sweep Sequencer**: 360° rotating radar beam triggering nodes like a cyclic clockwork sequencer.

### 🎨 Curated Presets
1. 🎋 **Zen Rain Garden**: Meditative rain drops on bamboo chimes (Hirajoshi scale, soft reverb).
2. ⚡ **Cyberpunk Radar 2088**: Rotating radar scanning 8 harmonic neon nodes with saw synth and delay.
3. 🌌 **Cosmic Gravity Wells**: Dual black holes pulling particles into chaotic, mesmerizing orbits.
4. 🪵 **Pinball Marimba Cascade**: Pachinko-style bouncing symphony on angled strings.
5. 🌀 **Quantum Warp Chords**: Looping portal network through harmonic laser strings.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` | Play / Pause Simulation |
| `1` – `8` | Select Canvas Tool |
| `R` | Reset Particles |
| `C` | Clear All Canvas Elements |
| `M` | Mute / Unmute Audio |
| `?` | Open Interactive Help Guide |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/sonic-canvas.git
cd sonic-canvas
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open `http://localhost:5173` in your browser!

### 3. Production Build
```bash
npm run build
```

---

## 🌐 Deploy to GitHub

To push this project to your GitHub account:

1. Create a new repository on [GitHub](https://github.com/new) named `sonic-canvas`.
2. Link remote and push:
```bash
git remote add origin https://github.com/<your-username>/sonic-canvas.git
git branch -M main
git push -u origin main
```

---

Made with ❤️ using React, Tailwind CSS & Web Audio API.
