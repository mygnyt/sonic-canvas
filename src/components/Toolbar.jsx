import React from 'react';
import { 
  Move, 
  Disc, 
  CircleDot, 
  Minus, 
  Flame, 
  Sparkles, 
  Radio, 
  Eraser 
} from 'lucide-react';

const TOOLS = [
  { id: 'select', label: 'Move & Select', icon: Move, shortcut: '1', desc: 'Drag items around the canvas' },
  { id: 'emitter', label: 'Cannon Emitter', icon: Disc, shortcut: '2', desc: 'Click & drag to aim rhythmic particle cannons' },
  { id: 'bell', label: 'Resonant Chime', icon: CircleDot, shortcut: '3', desc: 'Place tuned resonant bell notes' },
  { id: 'string', label: 'Laser String', icon: Minus, shortcut: '4', desc: 'Draw vibrating harmonic harp strings' },
  { id: 'gravity', label: 'Gravity Well', icon: Flame, shortcut: '5', desc: 'Create orbital black holes & pulsars' },
  { id: 'portal', label: 'Warp Portal', icon: Sparkles, shortcut: '6', desc: 'Place quantum teleportation gates' },
  { id: 'radar', label: 'Radar Sequencer', icon: Radio, shortcut: '7', desc: 'Toggle rotating radar beam scanner' },
  { id: 'eraser', label: 'Eraser', icon: Eraser, shortcut: '8', desc: 'Click any object to remove it' },
];

export function Toolbar({ activeTool, setActiveTool, radarEnabled, onToggleRadar }) {
  return (
    <aside className="fixed left-5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 p-2 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/60">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const isRadar = tool.id === 'radar';
        const isActive = isRadar ? radarEnabled : activeTool === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => {
              if (isRadar) {
                onToggleRadar();
              } else {
                setActiveTool(tool.id);
              }
            }}
            title={`${tool.label} (${tool.shortcut})\n${tool.desc}`}
            className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/40 ring-1 ring-white/30 scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Icon size={20} className="transition-transform group-hover:scale-110" />

            {/* Hover Tooltip */}
            <span className="pointer-events-none absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-950/95 border border-slate-800 text-xs text-slate-200 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-xl z-50">
              <span className="font-semibold text-indigo-400">{tool.label}</span>
              <span className="ml-1.5 px-1 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                {tool.shortcut}
              </span>
              <div className="text-[11px] text-slate-400 mt-0.5">{tool.desc}</div>
            </span>
          </button>
        );
      })}
    </aside>
  );
}
