import React, { useState } from 'react';
import {
  X,
  Music,
  Waves,
  Eye,
  Download,
  Upload,
  Zap,
} from 'lucide-react';
import { SCALES, ROOT_NOTES, SYNTH_TYPES } from '../audio/AudioEngine';

export function SettingsPanel({
  isOpen,
  onClose,
  synthType,
  onChangeSynthType,
  scale,
  onChangeScale,
  rootNote,
  onChangeRootNote,
  reverbWet,
  onChangeReverbWet,
  delayWet,
  onChangeDelayWet,
  delayTime,
  onChangeDelayTime,
  filterCutoff,
  onChangeFilterCutoff,
  gravityY,
  onChangeGravityY,
  gravityX,
  onChangeGravityX,
  elasticity,
  onChangeElasticity,
  showTrails,
  onToggleTrails,
  showGlow,
  onToggleGlow,
  showVisualizer,
  onToggleVisualizer,
  onExportScene,
  onImportScene,
}) {
  const [activeTab, setActiveTab] = useState('audio'); // 'audio', 'physics', 'visuals'

  if (!isOpen) return null;

  return (
    <div className="fixed right-5 top-20 bottom-5 w-84 z-30 flex flex-col rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 shadow-2xl shadow-black/70 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="text-indigo-400" size={18} />
          <span className="font-semibold text-sm text-slate-100">Studio Controls</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-1">
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'audio'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Music size={13} />
          <span>Synth & Audio</span>
        </button>

        <button
          onClick={() => setActiveTab('physics')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'physics'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Waves size={13} />
          <span>Physics</span>
        </button>

        <button
          onClick={() => setActiveTab('visuals')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'visuals'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye size={13} />
          <span>Visuals</span>
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* AUDIO TAB */}
        {activeTab === 'audio' && (
          <>
            {/* Synth Instrument Voice */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Synth Instrument Voice
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(SYNTH_TYPES).map(([typeKey, typeName]) => (
                  <button
                    key={typeKey}
                    onClick={() => onChangeSynthType(typeKey)}
                    className={`px-2.5 py-2 rounded-xl text-left font-medium transition-all cursor-pointer border ${
                      synthType === typeKey
                        ? 'bg-indigo-600/30 border-indigo-500/80 text-white shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {typeName}
                  </button>
                ))}
              </div>
            </div>

            {/* Root Key & Scale */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Scale & Root Tuning
              </label>
              <div className="flex gap-2">
                <select
                  value={rootNote}
                  onChange={(e) => onChangeRootNote(e.target.value)}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-200 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {ROOT_NOTES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                <select
                  value={scale}
                  onChange={(e) => onChangeScale(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-200 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {Object.entries(SCALES).map(([k, s]) => (
                    <option key={k} value={k}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Master Reverb */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Space Reverb Wet</span>
                <span className="font-mono text-indigo-400">{Math.round(reverbWet * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.02"
                value={reverbWet}
                onChange={(e) => onChangeReverbWet(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Master Delay */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Ping-Pong Delay</span>
                <span className="font-mono text-indigo-400">{Math.round(delayWet * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.7"
                step="0.02"
                value={delayWet}
                onChange={(e) => onChangeDelayWet(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Delay Time */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Delay Time</span>
                <span className="font-mono text-indigo-400">{Math.round(delayTime * 1000)} ms</span>
              </div>
              <input
                type="range"
                min="0.08"
                max="0.6"
                step="0.02"
                value={delayTime}
                onChange={(e) => onChangeDelayTime(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Master Filter Cutoff */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Filter Cutoff (Lowpass)</span>
                <span className="font-mono text-indigo-400">{Math.round(filterCutoff)} Hz</span>
              </div>
              <input
                type="range"
                min="500"
                max="16000"
                step="250"
                value={filterCutoff}
                onChange={(e) => onChangeFilterCutoff(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </>
        )}

        {/* PHYSICS TAB */}
        {activeTab === 'physics' && (
          <>
            {/* Gravity Presets */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Gravity Mode
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    onChangeGravityY(0.18);
                    onChangeGravityX(0);
                  }}
                  className={`p-2 rounded-xl text-center font-medium border cursor-pointer ${
                    gravityY > 0 && gravityX === 0
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Earth (Down)
                </button>
                <button
                  onClick={() => {
                    onChangeGravityY(0);
                    onChangeGravityX(0);
                  }}
                  className={`p-2 rounded-xl text-center font-medium border cursor-pointer ${
                    gravityY === 0 && gravityX === 0
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Zero-G
                </button>
                <button
                  onClick={() => {
                    onChangeGravityY(-0.18);
                    onChangeGravityX(0);
                  }}
                  className={`p-2 rounded-xl text-center font-medium border cursor-pointer ${
                    gravityY < 0 && gravityX === 0
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Anti-Gravity
                </button>
              </div>
            </div>

            {/* Gravity Y Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Vertical Gravity</span>
                <span className="font-mono text-indigo-400">{gravityY.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-0.4"
                max="0.4"
                step="0.02"
                value={gravityY}
                onChange={(e) => onChangeGravityY(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Gravity X (Wind) Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Horizontal Wind</span>
                <span className="font-mono text-indigo-400">{gravityX.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-0.3"
                max="0.3"
                step="0.02"
                value={gravityX}
                onChange={(e) => onChangeGravityX(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Elasticity Bounciness */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Elasticity (Bounciness)</span>
                <span className="font-mono text-indigo-400">{Math.round(elasticity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.98"
                step="0.02"
                value={elasticity}
                onChange={(e) => onChangeElasticity(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </>
        )}

        {/* VISUALS TAB */}
        {activeTab === 'visuals' && (
          <>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 cursor-pointer">
                <span className="text-slate-200">Motion Trails</span>
                <input
                  type="checkbox"
                  checked={showTrails}
                  onChange={onToggleTrails}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 cursor-pointer">
                <span className="text-slate-200">Neon Glow Bloom</span>
                <input
                  type="checkbox"
                  checked={showGlow}
                  onChange={onToggleGlow}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 cursor-pointer">
                <span className="text-slate-200">Audio Wave Spectrum</span>
                <input
                  type="checkbox"
                  checked={showVisualizer}
                  onChange={onToggleVisualizer}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer rounded"
                />
              </label>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Scene Backup
              </label>
              <div className="flex gap-2">
                <button
                  onClick={onExportScene}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors border border-slate-700 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export JSON</span>
                </button>

                <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors border border-slate-700 cursor-pointer">
                  <Upload size={13} />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportScene}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
