// Curated scenes and presets for SonicCanvas

export const PRESETS = [
  {
    id: 'zen_garden',
    name: '🎋 Zen Rain Garden',
    description: 'Gentle raindrops falling on tuned bamboo and crystal bells in Japanese Hirajoshi scale.',
    scale: 'hirajoshi',
    rootNote: 'D',
    synthType: 'bell',
    reverb: 0.5,
    delay: 0.35,
    setup: (w, h) => ({
      bpm: 90,
      gravity: { x: 0, y: 0.16 },
      friction: 0.998,
      elasticity: 0.85,
      emitters: [
        {
          x: w * 0.25,
          y: 70,
          angle: Math.PI / 2,
          speed: 2.5,
          intervalBeats: 2,
          ballColor: '#38bdf8',
          ballLife: 15,
        },
        {
          x: w * 0.5,
          y: 60,
          angle: Math.PI / 2,
          speed: 3,
          intervalBeats: 1.5,
          ballColor: '#a78bfa',
          ballLife: 15,
        },
        {
          x: w * 0.75,
          y: 70,
          angle: Math.PI / 2,
          speed: 2.8,
          intervalBeats: 2.5,
          ballColor: '#34d399',
          ballLife: 15,
        },
      ],
      bells: [
        { x: w * 0.22, y: h * 0.45, radius: 26, noteIndex: 0, noteLabel: 'D3', color: '#38bdf8' },
        { x: w * 0.32, y: h * 0.7, radius: 24, noteIndex: 2, noteLabel: 'F3', color: '#60a5fa' },
        { x: w * 0.48, y: h * 0.5, radius: 28, noteIndex: 4, noteLabel: 'Bb3', color: '#a78bfa' },
        { x: w * 0.65, y: h * 0.65, radius: 24, noteIndex: 6, noteLabel: 'D4', color: '#c084fc' },
        { x: w * 0.78, y: h * 0.45, radius: 22, noteIndex: 8, noteLabel: 'F4', color: '#34d399' },
      ],
      strings: [
        { x1: w * 0.15, y1: h * 0.85, x2: w * 0.4, y2: h * 0.82, color: '#0284c7' },
        { x1: w * 0.6, y1: h * 0.82, x2: w * 0.85, y2: h * 0.85, color: '#059669' },
      ],
      gravityWells: [],
      portals: [],
    }),
  },
  {
    id: 'cyberpunk_radar',
    name: '⚡ Cyberpunk Radar 2088',
    description: 'Circular radar sequencer scanning orbital synth nodes with high resonance & delay.',
    scale: 'phrygian',
    rootNote: 'C',
    synthType: 'cyber',
    reverb: 0.3,
    delay: 0.45,
    setup: (w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.28;
      const bells = [];
      const nodeCount = 8;
      const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4'];

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        bells.push({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          radius: 20,
          noteIndex: i * 2,
          noteLabel: `N${i + 1}`,
          color: colors[i % colors.length],
        });
      }

      return {
        bpm: 128,
        gravity: { x: 0, y: 0 },
        friction: 0.999,
        elasticity: 0.95,
        radar: {
          enabled: true,
          x: cx,
          y: cy,
          radius: radius + 40,
          speed: 0.025,
        },
        emitters: [
          {
            x: cx - radius - 80,
            y: cy,
            angle: 0.1,
            speed: 5.5,
            intervalBeats: 4,
            ballColor: '#ec4899',
            ballLife: 12,
          },
          {
            x: cx + radius + 80,
            y: cy,
            angle: Math.PI - 0.1,
            speed: 5.5,
            intervalBeats: 4,
            ballColor: '#06b6d4',
            ballLife: 12,
          },
        ],
        bells,
        strings: [],
        gravityWells: [],
        portals: [],
      };
    },
  },
  {
    id: 'cosmic_gravity',
    name: '🌌 Cosmic Gravity Wells',
    description: 'Black holes pulling particles into chaotic, mesmerizing gravitational orbits.',
    scale: 'lydian',
    rootNote: 'F',
    synthType: 'ambient',
    reverb: 0.65,
    delay: 0.35,
    setup: (w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      return {
        bpm: 110,
        gravity: { x: 0, y: 0 },
        friction: 0.9995,
        elasticity: 0.9,
        emitters: [
          {
            x: cx - 220,
            y: cy - 180,
            angle: 0.4,
            speed: 4.2,
            intervalBeats: 2,
            ballColor: '#a855f7',
            ballLife: 20,
          },
          {
            x: cx + 220,
            y: cy + 180,
            angle: Math.PI + 0.4,
            speed: 4.2,
            intervalBeats: 2,
            ballColor: '#38bdf8',
            ballLife: 20,
          },
        ],
        bells: [
          { x: cx, y: cy - 140, radius: 24, noteIndex: 2, noteLabel: 'G3', color: '#c084fc' },
          { x: cx, y: cy + 140, radius: 24, noteIndex: 5, noteLabel: 'B3', color: '#818cf8' },
          { x: cx - 180, y: cy, radius: 22, noteIndex: 7, noteLabel: 'D4', color: '#38bdf8' },
          { x: cx + 180, y: cy, radius: 22, noteIndex: 9, noteLabel: 'E4', color: '#34d399' },
        ],
        strings: [],
        gravityWells: [
          { x: cx - 60, y: cy, strength: 1.2, radius: 55 },
          { x: cx + 60, y: cy, strength: 1.2, radius: 55 },
        ],
        portals: [],
      };
    },
  },
  {
    id: 'pinball_cascade',
    name: '🪵 Pinball Marimba Cascade',
    description: 'Bouncing pachinko symphony with angled strings and snappy wooden marimba resonance.',
    scale: 'pentatonic_major',
    rootNote: 'C',
    synthType: 'marimba',
    reverb: 0.25,
    delay: 0.25,
    setup: (w, h) => ({
      bpm: 130,
      gravity: { x: 0, y: 0.22 },
      friction: 0.998,
      elasticity: 0.9,
      emitters: [
        {
          x: w * 0.5,
          y: 50,
          angle: Math.PI / 2,
          speed: 3.5,
          intervalBeats: 1,
          ballColor: '#f59e0b',
          ballLife: 15,
        },
      ],
      bells: [
        { x: w * 0.42, y: h * 0.32, radius: 24, noteIndex: 0, noteLabel: 'C3', color: '#fbbf24' },
        { x: w * 0.58, y: h * 0.32, radius: 24, noteIndex: 2, noteLabel: 'E3', color: '#f59e0b' },
        { x: w * 0.35, y: h * 0.52, radius: 22, noteIndex: 4, noteLabel: 'G3', color: '#ea580c' },
        { x: w * 0.5, y: h * 0.52, radius: 26, noteIndex: 5, noteLabel: 'A3', color: '#e11d48' },
        { x: w * 0.65, y: h * 0.52, radius: 22, noteIndex: 7, noteLabel: 'C4', color: '#d946ef' },
      ],
      strings: [
        { x1: w * 0.2, y1: h * 0.72, x2: w * 0.45, y2: h * 0.8, color: '#f59e0b' },
        { x1: w * 0.8, y1: h * 0.72, x2: w * 0.55, y2: h * 0.8, color: '#f59e0b' },
        { x1: w * 0.4, y1: h * 0.9, x2: w * 0.6, y2: h * 0.9, color: '#fbbf24' },
      ],
      gravityWells: [],
      portals: [],
    }),
  },
  {
    id: 'portal_odyssey',
    name: '🌀 Quantum Warp Chords',
    description: 'Quantum portals teleporting energetic particles through looping laser strings.',
    scale: 'dorian',
    rootNote: 'A',
    synthType: 'pluck',
    reverb: 0.4,
    delay: 0.4,
    setup: (w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      return {
        bpm: 120,
        gravity: { x: 0, y: 0.1 },
        friction: 0.999,
        elasticity: 0.92,
        emitters: [
          {
            x: cx - 240,
            y: cy - 100,
            angle: 0.2,
            speed: 5,
            intervalBeats: 2,
            ballColor: '#38bdf8',
            ballLife: 16,
          },
        ],
        bells: [
          { x: cx, y: cy - 80, radius: 24, noteIndex: 3, noteLabel: 'D4', color: '#38bdf8' },
          { x: cx, y: cy + 80, radius: 24, noteIndex: 6, noteLabel: 'G4', color: '#f97316' },
        ],
        strings: [
          { x1: cx - 180, y1: cy + 160, x2: cx + 180, y2: cy + 160, color: '#06b6d4' },
        ],
        gravityWells: [],
        portals: [
          { x: cx - 150, y: cy + 120, radius: 26, angle: -Math.PI / 2, color: '#38bdf8' },
          { x: cx + 150, y: cy - 120, radius: 26, angle: Math.PI / 2, color: '#f97316' },
        ],
      };
    },
  },
];
