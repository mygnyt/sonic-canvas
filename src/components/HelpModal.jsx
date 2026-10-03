import React from 'react';
import { X, Sparkles, Keyboard, Lightbulb, Music } from 'lucide-react';

export function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-500/10 overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">How to use SonicCanvas</h2>
              <p className="text-xs text-slate-400">Generative physics & musical playground</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Concept summary */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-indigo-200 text-xs leading-relaxed flex items-start gap-3">
            <Music className="text-indigo-400 shrink-0 mt-0.5" size={18} />
            <div>
              <strong className="text-white block mb-0.5">Physical Harmony:</strong>
              Every sound in SonicCanvas is created by physical collisions. Particles shot from emitters bounce against bells and vibrating laser strings, playing notes in the selected musical scale.
            </div>
          </div>

          {/* Tools guide */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lightbulb size={14} className="text-amber-400" />
              <span>Canvas Tools</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <strong className="text-indigo-300 block mb-1">Cannon Emitter (2)</strong>
                Click and drag anywhere to place an emitter pointing in that direction. It rhythmically launches energy spheres.
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <strong className="text-sky-300 block mb-1">Resonant Chimes (3)</strong>
                Click to place tuned bells. Balls bounce off them and ring notes mapped to their position and the current scale.
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <strong className="text-emerald-300 block mb-1">Laser Strings (4)</strong>
                Click and drag to draw elastic strings. When hit, they vibrate like guitar strings and produce harmonic plucks!
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <strong className="text-purple-300 block mb-1">Gravity Wells (5)</strong>
                Place black hole attractors or pulsars to bend particle trajectories into hypnotic orbital dances.
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <strong className="text-orange-300 block mb-1">Warp Portals (6)</strong>
                Click twice to link two quantum portals. Any particle entering portal A exits portal B with preserved momentum.
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <strong className="text-pink-300 block mb-1">Radar Sequencer (7)</strong>
                Toggle the sweeping circular radar beam. As it passes over chimes, it triggers them like a clockwork sequencer.
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Keyboard size={14} className="text-indigo-400" />
              <span>Keyboard Shortcuts</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-800/80">
                <span className="text-slate-400">Play / Pause</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">Space</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-800/80">
                <span className="text-slate-400">Reset Balls</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">R</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-800/80">
                <span className="text-slate-400">Clear Canvas</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">C</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-800/80">
                <span className="text-slate-400">Select Tools</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">1 - 8</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-800/80">
                <span className="text-slate-400">Mute Audio</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">M</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-800/80">
                <span className="text-slate-400">Help Guide</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">?</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
}
