import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getNextId } from '../physics/SimulationEngine';
import { audioEngine } from '../audio/AudioEngine';

const NOTE_COLORS = [
  '#38bdf8', '#818cf8', '#a78bfa', '#c084fc', '#f472b6',
  '#fb7185', '#f87171', '#fb923c', '#fbbf24', '#a3e635',
  '#4ade80', '#2dd4bf', '#22d3ee'
];

export function CanvasView({ engineRef, activeTool, onSelectTool }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [stats, setStats] = useState({ balls: 0, fps: 60 });
  const [pendingPortal, setPendingPortal] = useState(null);

  // Dragging / Creation state
  const isMouseDownRef = useRef(false);
  const dragStartRef = useRef(null);
  const draggedItemRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Update canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current || !engineRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      engineRef.current.resize(width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [engineRef]);

  // Track FPS and Ball count
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId = null;

    const tick = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setStats({
          balls: engineRef.current?.balls?.length || 0,
          fps: Math.round((frameCount * 1000) / (now - lastTime)),
        });
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [engineRef]);

  // Coordinate helper
  const getCanvasCoords = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Find object under mouse
  const findItemAt = (x, y) => {
    const engine = engineRef.current;
    if (!engine) return null;

    // Check Bells
    for (let i = engine.bells.length - 1; i >= 0; i--) {
      const b = engine.bells[i];
      if (Math.hypot(b.x - x, b.y - y) <= b.radius + 6) {
        return { type: 'bell', item: b, index: i };
      }
    }

    // Check Emitters
    for (let i = engine.emitters.length - 1; i >= 0; i--) {
      const em = engine.emitters[i];
      if (Math.hypot(em.x - x, em.y - y) <= (em.radius || 16) + 6) {
        return { type: 'emitter', item: em, index: i };
      }
    }

    // Check Gravity Wells
    for (let i = engine.gravityWells.length - 1; i >= 0; i--) {
      const gw = engine.gravityWells[i];
      if (Math.hypot(gw.x - x, gw.y - y) <= gw.radius) {
        return { type: 'gravity', item: gw, index: i };
      }
    }

    // Check Portals
    for (let i = engine.portals.length - 1; i >= 0; i--) {
      const p = engine.portals[i];
      if (Math.hypot(p.x - x, p.y - y) <= p.radius + 6) {
        return { type: 'portal', item: p, index: i };
      }
    }

    // Check Strings
    for (let i = engine.strings.length - 1; i >= 0; i--) {
      const str = engine.strings[i];
      const dx = str.x2 - str.x1;
      const dy = str.y2 - str.y1;
      const lenSq = dx * dx + dy * dy;
      if (lenSq > 0) {
        const t = Math.max(0, Math.min(1, ((x - str.x1) * dx + (y - str.y1) * dy) / lenSq));
        const px = str.x1 + t * dx;
        const py = str.y1 + t * dy;
        if (Math.hypot(x - px, y - py) <= 10) {
          return { type: 'string', item: str, index: i };
        }
      }
    }

    return null;
  };

  const handlePointerDown = (e) => {
    const engine = engineRef.current;
    if (!engine) return;
    audioEngine.ensureContext();

    const { x, y } = getCanvasCoords(e);
    isMouseDownRef.current = true;
    dragStartRef.current = { x, y };

    // Eraser Tool
    if (activeTool === 'eraser') {
      const found = findItemAt(x, y);
      if (found) {
        if (found.type === 'bell') engine.bells.splice(found.index, 1);
        if (found.type === 'emitter') engine.emitters.splice(found.index, 1);
        if (found.type === 'gravity') engine.gravityWells.splice(found.index, 1);
        if (found.type === 'string') engine.strings.splice(found.index, 1);
        if (found.type === 'portal') {
          // Remove linked pair
          const pIndex = Math.floor(found.index / 2) * 2;
          engine.portals.splice(pIndex, 2);
        }
        engine.spawnSparks(x, y, '#f43f5e');
      }
      return;
    }

    // Move & Select Tool
    if (activeTool === 'select') {
      const found = findItemAt(x, y);
      if (found) {
        draggedItemRef.current = found;
        engine.selectedItem = found.item;
        if (found.type === 'string') {
          dragOffsetRef.current = {
            ox1: found.item.x1 - x,
            oy1: found.item.y1 - y,
            ox2: found.item.x2 - x,
            oy2: found.item.y2 - y,
          };
        } else {
          dragOffsetRef.current = {
            ox: found.item.x - x,
            oy: found.item.y - y,
          };
        }
      } else {
        engine.selectedItem = null;
      }
      return;
    }

    // Placing Resonant Bell
    if (activeTool === 'bell') {
      const height = engine.height || 600;
      // Map screen Y to scale pitch (higher Y = lower pitch, lower Y = higher pitch like a piano)
      const noteCount = 14;
      const noteIndex = Math.floor((1 - y / height) * noteCount);
      const color = NOTE_COLORS[noteIndex % NOTE_COLORS.length];

      const newBell = {
        id: getNextId(),
        x,
        y,
        radius: 22,
        noteIndex: Math.max(0, noteIndex),
        color,
        glow: 1.0,
      };

      engine.bells.push(newBell);
      engine.triggerBell(newBell, 0.8);
      engine.spawnSparks(x, y, color);
      return;
    }

    // Placing Gravity Well
    if (activeTool === 'gravity') {
      const isRepel = e.shiftKey || e.altKey;
      const newWell = {
        id: getNextId(),
        x,
        y,
        strength: isRepel ? -1.2 : 1.2,
        radius: 50,
      };
      engine.gravityWells.push(newWell);
      engine.spawnSparks(x, y, isRepel ? '#ec4899' : '#a855f7');
      return;
    }

    // Placing Portals (in pairs)
    if (activeTool === 'portal') {
      if (!pendingPortal) {
        // Place Entrance
        const portalA = {
          id: getNextId(),
          x,
          y,
          radius: 26,
          angle: 0,
          color: '#38bdf8',
        };
        engine.portals.push(portalA);
        setPendingPortal(portalA);
        engine.spawnSparks(x, y, '#38bdf8');
      } else {
        // Place Exit
        const portalB = {
          id: getNextId(),
          x,
          y,
          radius: 26,
          angle: Math.PI,
          color: '#f97316',
        };
        engine.portals.push(portalB);
        setPendingPortal(null);
        engine.spawnSparks(x, y, '#f97316');
        audioEngine.playWarp();
      }
      return;
    }

    // String Tool Preview Start
    if (activeTool === 'string') {
      engine.creationPreview = {
        type: 'string',
        x1: x,
        y1: y,
        x2: x,
        y2: y,
      };
    }

    // Emitter Tool Preview Start
    if (activeTool === 'emitter') {
      engine.creationPreview = {
        type: 'emitter',
        x,
        y,
        targetX: x,
        targetY: y,
      };
    }
  };

  const handlePointerMove = (e) => {
    const engine = engineRef.current;
    if (!engine || !isMouseDownRef.current) return;
    const { x, y } = getCanvasCoords(e);

    // Dragging Existing Object
    if (activeTool === 'select' && draggedItemRef.current) {
      const { type, item } = draggedItemRef.current;
      if (type === 'string') {
        const off = dragOffsetRef.current;
        const width = item.x2 - item.x1;
        const height = item.y2 - item.y1;
        item.x1 = x + off.ox1;
        item.y1 = y + off.oy1;
        item.x2 = item.x1 + width;
        item.y2 = item.y1 + height;
      } else {
        item.x = x + dragOffsetRef.current.ox;
        item.y = y + dragOffsetRef.current.oy;
      }
      return;
    }

    // Updating String Preview
    if (activeTool === 'string' && engine.creationPreview) {
      engine.creationPreview.x2 = x;
      engine.creationPreview.y2 = y;
      return;
    }

    // Updating Emitter Preview
    if (activeTool === 'emitter' && engine.creationPreview) {
      engine.creationPreview.targetX = x;
      engine.creationPreview.targetY = y;
      return;
    }
  };

  const handlePointerUp = (e) => {
    const engine = engineRef.current;
    if (!engine || !isMouseDownRef.current) return;
    const { x, y } = getCanvasCoords(e);
    const start = dragStartRef.current;

    // Finalize String
    if (activeTool === 'string' && start && engine.creationPreview) {
      const dist = Math.hypot(x - start.x, y - start.y);
      if (dist > 18) {
        const newStr = {
          id: getNextId(),
          x1: start.x,
          y1: start.y,
          x2: x,
          y2: y,
          color: '#38bdf8',
          vibration: null,
        };
        engine.strings.push(newStr);
        audioEngine.triggerNote({ index: 8, velocity: 0.6, type: 'pluck' });
      }
      engine.creationPreview = null;
    }

    // Finalize Emitter
    if (activeTool === 'emitter' && start && engine.creationPreview) {
      const dx = x - start.x;
      const dy = y - start.y;
      const dist = Math.hypot(dx, dy);
      const angle = dist > 10 ? Math.atan2(dy, dx) : Math.PI / 2;

      const newEmitter = {
        id: getNextId(),
        x: start.x,
        y: start.y,
        angle,
        speed: 4.8,
        intervalBeats: 2,
        ballColor: '#38bdf8',
        ballLife: 15,
        radius: 16,
        active: true,
        lastFired: 0,
      };

      engine.emitters.push(newEmitter);
      engine.spawnBallFromEmitter(newEmitter);
      engine.creationPreview = null;
    }

    isMouseDownRef.current = false;
    draggedItemRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-crosshair bg-[#08090d]"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        className="w-full h-full block"
      />

      {/* Floating HUD status indicator in bottom left */}
      <div className="pointer-events-none absolute bottom-4 left-20 z-20 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{stats.fps} FPS</span>
        </span>
        <span className="h-3 w-px bg-slate-800" />
        <span>Balls: <strong className="text-slate-200">{stats.balls}</strong></span>
        <span className="h-3 w-px bg-slate-800" />
        <span>Mode: <strong className="text-indigo-400 capitalize">{activeTool}</strong></span>
      </div>

      {/* Hint for pending portal */}
      {pendingPortal && (
        <div className="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 backdrop-blur-xl text-xs font-medium text-indigo-200 shadow-xl animate-bounce">
          🌀 Portal Entrance placed! Click anywhere to place the Portal Exit gate.
        </div>
      )}
    </div>
  );
}
