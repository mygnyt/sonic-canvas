import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SimulationEngine } from './physics/SimulationEngine';
import { audioEngine } from './audio/AudioEngine';
import { PRESETS } from './presets/presets';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { SettingsPanel } from './components/SettingsPanel';
import { HelpModal } from './components/HelpModal';
import { CanvasView } from './components/CanvasView';

export function App() {
  const engineRef = useRef(null);
  const [activeTool, setActiveTool] = useState('emitter');
  const [isPlaying, setIsPlaying] = useState(true);
  const [bpm, setBpm] = useState(110);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [radarEnabled, setRadarEnabled] = useState(false);

  // Audio parameters
  const [synthType, setSynthType] = useState('bell');
  const [scale, setScale] = useState('hirajoshi');
  const [rootNote, setRootNote] = useState('C');
  const [reverbWet, setReverbWet] = useState(0.4);
  const [delayWet, setDelayWet] = useState(0.35);
  const [delayTime, setDelayTime] = useState(0.28);
  const [filterCutoff, setFilterCutoff] = useState(12000);

  // Physics parameters
  const [gravityY, setGravityY] = useState(0.18);
  const [gravityX, setGravityX] = useState(0);
  const [elasticity, setElasticity] = useState(0.88);

  // Visuals parameters
  const [showTrails, setShowTrails] = useState(true);
  const [showGlow, setShowGlow] = useState(true);
  const [showVisualizer, setShowVisualizer] = useState(true);

  // Initialize Canvas and Engine
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const engine = new SimulationEngine(canvas);
    engineRef.current = engine;
    engine.start();

    // Load initial preset (Zen Rain Garden)
    const initialPreset = PRESETS[0];
    applyPreset(initialPreset, engine);

    return () => {
      engine.stop();
    };
  }, []);

  // Preset Applicator
  const applyPreset = useCallback((preset, engInstance = null) => {
    const engine = engInstance || engineRef.current;
    if (!engine) return;

    if (preset.scale) {
      setScale(preset.scale);
      audioEngine.setScale(preset.scale);
    }
    if (preset.rootNote) {
      setRootNote(preset.rootNote);
      audioEngine.setRootNote(preset.rootNote);
    }
    if (preset.synthType) {
      setSynthType(preset.synthType);
      audioEngine.setSynthType(preset.synthType);
    }
    if (preset.reverb !== undefined) {
      setReverbWet(preset.reverb);
      audioEngine.setReverbWet(preset.reverb);
    }
    if (preset.delay !== undefined) {
      setDelayWet(preset.delay);
      audioEngine.setDelayWet(preset.delay);
    }

    const sceneData = preset.setup(engine.width || 1200, engine.height || 700);
    engine.loadScene(sceneData);

    setBpm(engine.bpm);
    setGravityY(engine.gravity.y);
    setGravityX(engine.gravity.x);
    setElasticity(engine.elasticity);
    setRadarEnabled(!!engine.radar?.enabled);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        resetBalls();
      } else if (e.key === 'c' || e.key === 'C') {
        clearAll();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setIsHelpOpen((prev) => !prev);
      } else if (e.key >= '1' && e.key <= '8') {
        const toolMap = {
          '1': 'select',
          '2': 'emitter',
          '3': 'bell',
          '4': 'string',
          '5': 'gravity',
          '6': 'portal',
          '7': 'radar',
          '8': 'eraser',
        };
        const tool = toolMap[e.key];
        if (tool === 'radar') {
          toggleRadar();
        } else if (tool) {
          setActiveTool(tool);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, radarEnabled]);

  // Controls Handlers
  const togglePlay = () => {
    if (!engineRef.current) return;
    const next = !isPlaying;
    setIsPlaying(next);
    engineRef.current.isPlaying = next;
  };

  const resetBalls = () => {
    engineRef.current?.clearBalls();
  };

  const clearAll = () => {
    engineRef.current?.clearAll();
    setRadarEnabled(false);
  };

  const changeBpm = (val) => {
    setBpm(val);
    if (engineRef.current) engineRef.current.bpm = val;
  };

  const changeVolume = (val) => {
    setVolume(val);
    audioEngine.setVolume(val);
  };

  const toggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const toggleRadar = () => {
    if (!engineRef.current) return;
    const next = !radarEnabled;
    setRadarEnabled(next);
    engineRef.current.radar.enabled = next;
  };

  // Audio Recording
  const startRecording = () => {
    const ok = audioEngine.startRecording();
    if (ok) setIsRecording(true);
  };

  const stopRecording = async () => {
    const blob = await audioEngine.stopRecording();
    setIsRecording(false);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sonic-canvas-track-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Scene Import / Export
  const exportScene = () => {
    if (!engineRef.current) return;
    const scene = engineRef.current.exportScene();
    scene.audio = { synthType, scale, rootNote, reverbWet, delayWet, delayTime, filterCutoff };
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonic-canvas-scene-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importScene = (e) => {
    const file = e.target.files?.[0];
    if (!file || !engineRef.current) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const scene = JSON.parse(event.target.result);
        engineRef.current.loadScene(scene);
        if (scene.audio) {
          if (scene.audio.synthType) {
            setSynthType(scene.audio.synthType);
            audioEngine.setSynthType(scene.audio.synthType);
          }
          if (scene.audio.scale) {
            setScale(scene.audio.scale);
            audioEngine.setScale(scene.audio.scale);
          }
          if (scene.audio.rootNote) {
            setRootNote(scene.audio.rootNote);
            audioEngine.setRootNote(scene.audio.rootNote);
          }
        }
        setBpm(engineRef.current.bpm);
        setGravityY(engineRef.current.gravity.y);
        setGravityX(engineRef.current.gravity.x);
        setElasticity(engineRef.current.elasticity);
        setRadarEnabled(!!engineRef.current.radar?.enabled);
      } catch (err) {
        console.error('Invalid scene JSON', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#08090d]">
      {/* Top Header Bar */}
      <Header
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onResetBalls={resetBalls}
        onClearAll={clearAll}
        bpm={bpm}
        onChangeBpm={changeBpm}
        volume={volume}
        onChangeVolume={changeVolume}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onSelectPreset={applyPreset}
        isRecording={isRecording}
        onStartRecord={startRecording}
        onStopRecord={stopRecording}
        onToggleSettings={() => setIsSettingsOpen((prev) => !prev)}
        isSettingsOpen={isSettingsOpen}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Left Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        radarEnabled={radarEnabled}
        onToggleRadar={toggleRadar}
      />

      {/* Center Interactive Canvas */}
      <CanvasView
        engineRef={engineRef}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        synthType={synthType}
        onChangeSynthType={(t) => {
          setSynthType(t);
          audioEngine.setSynthType(t);
        }}
        scale={scale}
        onChangeScale={(s) => {
          setScale(s);
          audioEngine.setScale(s);
        }}
        rootNote={rootNote}
        onChangeRootNote={(r) => {
          setRootNote(r);
          audioEngine.setRootNote(r);
        }}
        reverbWet={reverbWet}
        onChangeReverbWet={(r) => {
          setReverbWet(r);
          audioEngine.setReverbWet(r);
        }}
        delayWet={delayWet}
        onChangeDelayWet={(d) => {
          setDelayWet(d);
          audioEngine.setDelayWet(d);
        }}
        delayTime={delayTime}
        onChangeDelayTime={(t) => {
          setDelayTime(t);
          audioEngine.setDelayTime(t);
        }}
        filterCutoff={filterCutoff}
        onChangeFilterCutoff={(f) => {
          setFilterCutoff(f);
          audioEngine.setFilterCutoff(f);
        }}
        gravityY={gravityY}
        onChangeGravityY={(gy) => {
          setGravityY(gy);
          if (engineRef.current) engineRef.current.gravity.y = gy;
        }}
        gravityX={gravityX}
        onChangeGravityX={(gx) => {
          setGravityX(gx);
          if (engineRef.current) engineRef.current.gravity.x = gx;
        }}
        elasticity={elasticity}
        onChangeElasticity={(e) => {
          setElasticity(e);
          if (engineRef.current) engineRef.current.elasticity = e;
        }}
        showTrails={showTrails}
        onToggleTrails={() => {
          setShowTrails((prev) => {
            const next = !prev;
            if (engineRef.current) engineRef.current.showTrails = next;
            return next;
          });
        }}
        showGlow={showGlow}
        onToggleGlow={() => {
          setShowGlow((prev) => {
            const next = !prev;
            if (engineRef.current) engineRef.current.showGlow = next;
            return next;
          });
        }}
        showVisualizer={showVisualizer}
        onToggleVisualizer={() => {
          setShowVisualizer((prev) => {
            const next = !prev;
            if (engineRef.current) engineRef.current.showVisualizer = next;
            return next;
          });
        }}
        onExportScene={exportScene}
        onImportScene={importScene}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default App;
