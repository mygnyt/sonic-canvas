import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
  Sliders,
  HelpCircle,
  Maximize2,
  Minimize2,
  Sparkles,
  Square,
  Music4
} from 'lucide-react';
import { PRESETS } from '../presets/presets';

export function Header({
  isPlaying,
  onTogglePlay,
  onResetBalls,
  onClearAll,
  bpm,
  onChangeBpm,
  volume,
  onChangeVolume,
  isMuted,
  onToggleMute,
  onSelectPreset,
  isRecording,
  onStartRecord,
  onStopRecord,
  onToggleSettings,
  isSettingsOpen,
  onOpenHelp,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setRecordTimer((t) => t + 1), 1000);
    return () => {
      clearInterval(interval);
      setRecordTimer(0);
    };
  }, [isRecording]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="fixed top-4 left-4 right-4 z-30 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/40">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Music4 className="text-white" size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent tracking-tight">
              SonicCanvas
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Generative Audio-Visual Sandbox
          </p>
        </div>
      </div>

      {/* Playback & Tempo Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-lg ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
              : 'bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-500'
          }`}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span className="hidden md:inline">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          onClick={onResetBalls}
          title="Reset Particles (R)"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
        >
          <RotateCcw size={17} />
        </button>

        <button
          onClick={onClearAll}
          title="Clear Canvas (C)"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <Trash2 size={17} />
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* BPM Slider */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <span className="text-xs font-medium text-slate-400">BPM</span>
          <input
            type="range"
            min="60"
            max="180"
            value={bpm}
            onChange={(e) => onChangeBpm(Number(e.target.value))}
            className="w-18 accent-indigo-500 cursor-pointer"
          />
          <span className="text-xs font-mono font-semibold text-indigo-300 w-7 text-right">
            {bpm}
          </span>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <select
            onChange={(e) => {
              const p = PRESETS.find((pr) => pr.id === e.target.value);
              if (p) onSelectPreset(p);
            }}
            defaultValue=""
            className="appearance-none bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 px-3 py-2 pr-8 rounded-xl border border-slate-700/70 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" disabled>
              ✨ Select Preset Scene...
            </option>
            {PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <Sparkles
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Live Audio Recording */}
        {isRecording ? (
          <button
            onClick={onStopRecord}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600/90 text-white font-medium text-xs shadow-lg shadow-rose-600/40 animate-pulse cursor-pointer"
          >
            <Square size={13} fill="currentColor" />
            <span>REC {formatTimer(recordTimer)}</span>
          </button>
        ) : (
          <button
            onClick={onStartRecord}
            title="Record Audio to WebM"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700/70 transition-all text-xs font-medium cursor-pointer"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="hidden sm:inline">Record</span>
          </button>
        )}

        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Master Volume */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onChangeVolume(Number(e.target.value))}
            className="w-16 accent-indigo-500 cursor-pointer hidden xl:block"
          />
        </div>

        {/* Settings Toggle */}
        <button
          onClick={onToggleSettings}
          title="Sound & Physics Controls"
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isSettingsOpen
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Sliders size={17} />
        </button>

        {/* Help Modal */}
        <button
          onClick={onOpenHelp}
          title="How to play & hotkeys"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
        >
          <HelpCircle size={17} />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer hidden md:block"
        >
          {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>
      </div>
    </header>
  );
}
