// High-performance Canvas & Physics Engine for SonicCanvas
import { audioEngine } from '../audio/AudioEngine';

let nextId = 1;
export const getNextId = () => `sc_${nextId++}`;

export class SimulationEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Simulation state
    this.isPlaying = true;
    this.bpm = 120;
    this.gravity = { x: 0, y: 0.18 };
    this.friction = 0.998;
    this.elasticity = 0.88;
    this.wallBounce = true;
    this.showTrails = true;
    this.showGlow = true;
    this.showVisualizer = true;

    // Entities
    this.balls = [];
    this.emitters = [];
    this.bells = [];
    this.strings = [];
    this.gravityWells = [];
    this.portals = [];
    this.radar = {
      enabled: false,
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 260,
      angle: 0,
      speed: 0.02,
      triggeredNodes: new Set(),
    };

    // Visual FX
    this.sparks = [];
    this.ripples = [];

    // Interaction state
    this.activeTool = 'emitter'; // 'select', 'emitter', 'bell', 'string', 'gravity', 'portal', 'eraser'
    this.selectedItem = null;
    this.dragStart = null;
    this.currentPointer = { x: 0, y: 0 };
    this.isDragging = false;
    this.creationPreview = null;

    // Animation frame handle
    this.animId = null;
    this.lastTime = performance.now();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    if (this.radar) {
      if (this.radar.x > width) this.radar.x = width / 2;
      if (this.radar.y > height) this.radar.y = height / 2;
    }
  }

  start() {
    if (!this.animId) {
      this.lastTime = performance.now();
      const loop = (time) => {
        this.update(time);
        this.render();
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  // Update physics and emitters
  update(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.isPlaying) return;

    // Update Emitters
    for (const emitter of this.emitters) {
      if (!emitter.active) continue;
      const interval = (60 / this.bpm) * 1000 * (emitter.intervalBeats || 1);
      if (!emitter.lastFired || currentTime - emitter.lastFired >= interval) {
        emitter.lastFired = currentTime;
        this.spawnBallFromEmitter(emitter);
      }
    }

    // Update Radar Sweep
    if (this.radar && this.radar.enabled) {
      const prevAngle = this.radar.angle;
      this.radar.angle = (this.radar.angle + this.radar.speed) % (Math.PI * 2);

      // Check bells swept by radar line
      for (const bell of this.bells) {
        const dx = bell.x - this.radar.x;
        const dy = bell.y - this.radar.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= this.radar.radius) {
          let nodeAngle = Math.atan2(dy, dx);
          if (nodeAngle < 0) nodeAngle += Math.PI * 2;

          let swept = false;
          if (prevAngle < this.radar.angle) {
            swept = nodeAngle >= prevAngle && nodeAngle <= this.radar.angle;
          } else {
            swept = nodeAngle >= prevAngle || nodeAngle <= this.radar.angle;
          }

          if (swept && !this.radar.triggeredNodes.has(bell.id)) {
            this.radar.triggeredNodes.add(bell.id);
            this.triggerBell(bell, 0.7);
          } else if (!swept) {
            this.radar.triggeredNodes.delete(bell.id);
          }
        }
      }
    }

    // Update Strings Vibration
    for (const str of this.strings) {
      if (str.vibration && str.vibration.amplitude > 0.05) {
        str.vibration.time += dt * 35;
        str.vibration.amplitude *= 0.93; // dampening
      } else {
        str.vibration = null;
      }
    }

    // Update Bells Glow
    for (const bell of this.bells) {
      if (bell.glow > 0.01) {
        bell.glow *= 0.94;
      } else {
        bell.glow = 0;
      }
    }

    // Update Balls Physics
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];

      // Lifespan check
      ball.life -= dt;
      if (ball.life <= 0) {
        this.balls.splice(i, 1);
        continue;
      }

      // Apply Gravity
      ball.vx += this.gravity.x;
      ball.vy += this.gravity.y;

      // Apply Gravity Wells
      for (const well of this.gravityWells) {
        const dx = well.x - ball.x;
        const dy = well.y - ball.y;
        const distSq = dx * dx + dy * dy + 400; // avoid singularity
        const dist = Math.sqrt(distSq);
        const force = (well.strength * 1200) / distSq;
        ball.vx += (dx / dist) * force;
        ball.vy += (dy / dist) * force;
      }

      // Air resistance
      ball.vx *= this.friction;
      ball.vy *= this.friction;

      // Position update
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Trail recording
      if (this.showTrails) {
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 12) ball.trail.shift();
      }

      // Wall Bouncing
      if (this.wallBounce) {
        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.vx = -ball.vx * this.elasticity;
        } else if (ball.x + ball.radius > this.width) {
          ball.x = this.width - ball.radius;
          ball.vx = -ball.vx * this.elasticity;
        }
        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.vy = -ball.vy * this.elasticity;
        } else if (ball.y + ball.radius > this.height) {
          ball.y = this.height - ball.radius;
          ball.vy = -ball.vy * this.elasticity;
        }
      }

      // Collision with Bells
      for (const bell of this.bells) {
        const dx = ball.x - bell.x;
        const dy = ball.y - bell.y;
        const dist = Math.hypot(dx, dy);
        const minDist = ball.radius + bell.radius;

        if (dist < minDist) {
          // Normal vector
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);

          // Separate ball
          ball.x = bell.x + nx * minDist;
          ball.y = bell.y + ny * minDist;

          // Reflect velocity
          const dot = ball.vx * nx + ball.vy * ny;
          if (dot < 0) {
            ball.vx = (ball.vx - 2 * dot * nx) * this.elasticity;
            ball.vy = (ball.vy - 2 * dot * ny) * this.elasticity;
          }

          // Trigger sound & visual FX
          const impactSpeed = Math.hypot(ball.vx, ball.vy);
          this.triggerBell(bell, Math.min(1.0, impactSpeed / 8));
          this.spawnSparks(ball.x, ball.y, bell.color);
        }
      }

      // Collision with Elastic Strings
      for (const str of this.strings) {
        this.checkStringCollision(ball, str);
      }

      // Collision with Portals
      for (let pIdx = 0; pIdx < this.portals.length; pIdx += 2) {
        const portalA = this.portals[pIdx];
        const portalB = this.portals[pIdx + 1];
        if (!portalA || !portalB) continue;

        this.checkPortalTeleport(ball, portalA, portalB);
        this.checkPortalTeleport(ball, portalB, portalA);
      }
    }

    // Update Sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha -= dt * 2.2;
      if (sp.alpha <= 0) {
        this.sparks.splice(i, 1);
      }
    }

    // Update Shockwave Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rp = this.ripples[i];
      rp.radius += dt * 90;
      rp.alpha -= dt * 1.5;
      if (rp.alpha <= 0) {
        this.ripples.splice(i, 1);
      }
    }
  }

  // Trigger Bell Sound and Ripple
  triggerBell(bell, velocity = 0.8) {
    bell.glow = 1.0;
    const pan = (bell.x / this.width) * 2 - 1; // -1 (left) to +1 (right)

    audioEngine.triggerNote({
      index: bell.noteIndex,
      velocity: Math.max(0.2, velocity),
      pan,
    });

    this.ripples.push({
      x: bell.x,
      y: bell.y,
      radius: bell.radius,
      maxRadius: bell.radius + 60,
      color: bell.color,
      alpha: 0.9,
    });
  }

  // String Physics & Reflection
  checkStringCollision(ball, str) {
    const x1 = str.x1;
    const y1 = str.y1;
    const x2 = str.x2;
    const y2 = str.y2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return;

    // Projection scalar t
    let t = ((ball.x - x1) * dx + (ball.y - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    const distX = ball.x - projX;
    const distY = ball.y - projY;
    const dist = Math.hypot(distX, distY);

    if (dist < ball.radius + 3) {
      // Normal vector
      const nx = distX / (dist || 1);
      const ny = distY / (dist || 1);

      // Reposition
      ball.x = projX + nx * (ball.radius + 3);
      ball.y = projY + ny * (ball.radius + 3);

      const dot = ball.vx * nx + ball.vy * ny;
      if (dot < 0) {
        ball.vx = (ball.vx - 2 * dot * nx) * this.elasticity;
        ball.vy = (ball.vy - 2 * dot * ny) * this.elasticity;
      }

      // Vibrate String
      str.vibration = {
        amplitude: Math.min(12, Math.hypot(ball.vx, ball.vy) * 2.2),
        frequency: Math.max(2, 200 / (Math.sqrt(lenSq) || 50)),
        time: 0,
      };

      // Sound based on string length & screen position
      const noteIndex = Math.floor((1 - Math.min(1, Math.sqrt(lenSq) / 500)) * 16);
      const pan = (projX / this.width) * 2 - 1;
      audioEngine.triggerNote({
        index: noteIndex,
        velocity: Math.min(1.0, Math.hypot(ball.vx, ball.vy) / 6),
        type: 'pluck',
        pan,
      });

      this.spawnSparks(projX, projY, str.color || '#38bdf8');
    }
  }

  // Portal Teleportation
  checkPortalTeleport(ball, portalFrom, portalTo) {
    if (ball.lastTeleport && performance.now() - ball.lastTeleport < 350) return;

    const dx = ball.x - portalFrom.x;
    const dy = ball.y - portalFrom.y;
    const dist = Math.hypot(dx, dy);

    if (dist < portalFrom.radius + ball.radius) {
      // Offset ball at exit
      const exitAngle = portalTo.angle || 0;
      const speed = Math.hypot(ball.vx, ball.vy);
      ball.x = portalTo.x + Math.cos(exitAngle) * (portalTo.radius + ball.radius + 6);
      ball.y = portalTo.y + Math.sin(exitAngle) * (portalTo.radius + ball.radius + 6);

      // Redirect velocity out of portal
      ball.vx = Math.cos(exitAngle) * speed;
      ball.vy = Math.sin(exitAngle) * speed;
      ball.lastTeleport = performance.now();

      // Visuals & Sound
      audioEngine.playWarp();
      this.ripples.push({
        x: portalTo.x,
        y: portalTo.y,
        radius: portalTo.radius,
        color: portalTo.color,
        alpha: 1.0,
      });
      this.spawnSparks(portalTo.x, portalTo.y, portalTo.color);
    }
  }

  spawnBallFromEmitter(emitter) {
    const angle = emitter.angle;
    const speed = emitter.speed || 6.5;
    const spawnX = emitter.x + Math.cos(angle) * (emitter.radius + 8);
    const spawnY = emitter.y + Math.sin(angle) * (emitter.radius + 8);

    this.balls.push({
      x: spawnX,
      y: spawnY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: emitter.ballRadius || 5.5,
      color: emitter.ballColor || '#38bdf8',
      trail: [],
      life: emitter.ballLife || 14,
    });
  }

  spawnSparks(x, y, color = '#f59e0b') {
    const count = 7;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        color,
        size: Math.random() * 2.5 + 1,
      });
    }
  }

  // --- Rendering Loop ---
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Subtle Grid Background
    this.renderGrid(ctx);

    // Audio Visualizer Spectrum Wave in Background
    if (this.showVisualizer) {
      this.renderAudioVisualizer(ctx);
    }

    // Render Radar Sweep
    if (this.radar && this.radar.enabled) {
      this.renderRadar(ctx);
    }

    // Render Gravity Wells
    for (const well of this.gravityWells) {
      this.renderGravityWell(ctx, well);
    }

    // Render Portals
    for (let i = 0; i < this.portals.length; i++) {
      this.renderPortal(ctx, this.portals[i], i % 2 === 0 ? '#38bdf8' : '#f97316');
    }

    // Render Elastic Strings
    for (const str of this.strings) {
      this.renderString(ctx, str);
    }

    // Render Bells (Chimes)
    for (const bell of this.bells) {
      this.renderBell(ctx, bell);
    }

    // Render Emitters
    for (const emitter of this.emitters) {
      this.renderEmitter(ctx, emitter);
    }

    // Render Ripples (Shockwaves)
    for (const rp of this.ripples) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.strokeStyle = rp.color;
      ctx.globalAlpha = Math.max(0, rp.alpha);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    // Render Sparks
    for (const sp of this.sparks) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = Math.max(0, sp.alpha);
      ctx.shadowBlur = 6;
      ctx.shadowColor = sp.color;
      ctx.fill();
      ctx.restore();
    }

    // Render Balls
    for (const ball of this.balls) {
      this.renderBall(ctx, ball);
    }

    // Render Interactive Creation Preview
    if (this.creationPreview) {
      this.renderCreationPreview(ctx, this.creationPreview);
    }
  }

  renderGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < this.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderAudioVisualizer(ctx) {
    const data = audioEngine.getVisualizerData();
    if (!data.waveform || data.waveform.length === 0) return;

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = this.width / data.waveform.length;
    let x = 0;

    for (let i = 0; i < data.waveform.length; i++) {
      const v = data.waveform[i] / 128.0; // 0 to 2
      const y = (v * this.height) / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();
    ctx.restore();
  }

  renderRadar(ctx) {
    const r = this.radar;
    ctx.save();

    // Radar circle outline
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotating Sweep Arc
    const gradient = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.radius);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.arc(r.x, r.y, r.radius, r.angle - 0.4, r.angle);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Leading Sweep Line
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x + Math.cos(r.angle) * r.radius, r.y + Math.sin(r.angle) * r.radius);
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#818cf8';
    ctx.stroke();

    // Center Hub
    ctx.beginPath();
    ctx.arc(r.x, r.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#c7d2fe';
    ctx.fill();

    ctx.restore();
  }

  renderBall(ctx, ball) {
    ctx.save();

    // Trails
    if (this.showTrails && ball.trail.length > 1) {
      for (let i = 0; i < ball.trail.length - 1; i++) {
        const p1 = ball.trail[i];
        const p2 = ball.trail[i + 1];
        const ratio = (i + 1) / ball.trail.length;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = ball.color;
        ctx.globalAlpha = ratio * 0.4;
        ctx.lineWidth = ball.radius * ratio * 1.3;
        ctx.stroke();
      }
    }

    // Ball Body with Glow
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    if (this.showGlow) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = ball.color;
    }
    ctx.fill();
    ctx.restore();
  }

  renderBell(ctx, bell) {
    ctx.save();
    const isSelected = this.selectedItem?.id === bell.id;

    // Glowing aura when triggered
    if (bell.glow > 0.05) {
      ctx.beginPath();
      ctx.arc(bell.x, bell.y, bell.radius + bell.glow * 14, 0, Math.PI * 2);
      ctx.fillStyle = bell.color;
      ctx.globalAlpha = bell.glow * 0.45;
      ctx.shadowBlur = 20;
      ctx.shadowColor = bell.color;
      ctx.fill();
    }

    // Bell Core Ring
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(bell.x, bell.y, bell.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#ffffff' : bell.color;
    ctx.lineWidth = isSelected ? 3 : 2;
    if (this.showGlow) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = bell.color;
    }
    ctx.stroke();

    // Inner resonant circle
    ctx.beginPath();
    ctx.arc(bell.x, bell.y, bell.radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = bell.color;
    ctx.globalAlpha = 0.7 + bell.glow * 0.3;
    ctx.fill();

    // Scale note label
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.85;
    ctx.fillText(bell.noteLabel || `${bell.noteIndex + 1}`, bell.x, bell.y + bell.radius + 14);

    ctx.restore();
  }

  renderString(ctx, str) {
    ctx.save();
    const isSelected = this.selectedItem?.id === str.id;
    const vib = str.vibration;
    const offset = vib ? Math.sin(vib.time * vib.frequency) * vib.amplitude : 0;

    // Midpoint displaced by vibration normal
    const midX = (str.x1 + str.x2) / 2;
    const midY = (str.y1 + str.y2) / 2;
    const dx = str.x2 - str.x1;
    const dy = str.y2 - str.y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const ctrlX = midX + nx * offset;
    const ctrlY = midY + ny * offset;

    // Laser / String path
    ctx.beginPath();
    ctx.moveTo(str.x1, str.y1);
    ctx.quadraticCurveTo(ctrlX, ctrlY, str.x2, str.y2);

    ctx.strokeStyle = isSelected ? '#ffffff' : (str.color || '#38bdf8');
    ctx.lineWidth = isSelected ? 3.5 : 2.5;
    if (this.showGlow) {
      ctx.shadowBlur = vib ? 18 : 10;
      ctx.shadowColor = str.color || '#38bdf8';
    }
    ctx.stroke();

    // String Anchor endpoints
    for (const [x, y] of [[str.x1, str.y1], [str.x2, str.y2]]) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = str.color || '#38bdf8';
      ctx.fill();
    }
    ctx.restore();
  }

  renderEmitter(ctx, emitter) {
    ctx.save();
    const isSelected = this.selectedItem?.id === emitter.id;

    // Base circle
    ctx.beginPath();
    ctx.arc(emitter.x, emitter.y, emitter.radius || 16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#ffffff' : (emitter.ballColor || '#38bdf8');
    ctx.lineWidth = isSelected ? 3 : 2;
    if (this.showGlow) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = emitter.ballColor || '#38bdf8';
    }
    ctx.stroke();

    // Direction Cannon Nozzle
    const r = emitter.radius || 16;
    const angle = emitter.angle || 0;
    const nx = emitter.x + Math.cos(angle) * (r + 7);
    const ny = emitter.y + Math.sin(angle) * (r + 7);

    ctx.beginPath();
    ctx.moveTo(emitter.x, emitter.y);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = emitter.ballColor || '#38bdf8';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Inner LED pulsing
    ctx.beginPath();
    ctx.arc(emitter.x, emitter.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = emitter.active ? (emitter.ballColor || '#38bdf8') : '#64748b';
    ctx.fill();

    ctx.restore();
  }

  renderGravityWell(ctx, well) {
    ctx.save();
    const isAttractor = well.strength > 0;
    const color = isAttractor ? '#a855f7' : '#ec4899';
    const isSelected = this.selectedItem?.id === well.id;

    // Swirling aura
    const gradient = ctx.createRadialGradient(well.x, well.y, 2, well.x, well.y, well.radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(well.x, well.y, well.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.35;
    ctx.fill();

    // Singularity center
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(well.x, well.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = isAttractor ? '#18022e' : '#2b091e';
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#ffffff' : color;
    ctx.lineWidth = 2;
    if (this.showGlow) {
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;
    }
    ctx.stroke();

    ctx.restore();
  }

  renderPortal(ctx, portal, color) {
    ctx.save();
    const isSelected = this.selectedItem?.id === portal.id;

    // Portal Oval
    ctx.beginPath();
    ctx.ellipse(portal.x, portal.y, portal.radius, portal.radius * 0.55, portal.angle || 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#ffffff' : color;
    ctx.lineWidth = 2.5;
    if (this.showGlow) {
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;
    }
    ctx.stroke();

    // Center Swirl
    ctx.beginPath();
    ctx.arc(portal.x, portal.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
  }

  renderCreationPreview(ctx, preview) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;

    if (preview.type === 'string') {
      ctx.beginPath();
      ctx.moveTo(preview.x1, preview.y1);
      ctx.lineTo(preview.x2, preview.y2);
      ctx.stroke();
    } else if (preview.type === 'emitter') {
      ctx.beginPath();
      ctx.arc(preview.x, preview.y, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(preview.x, preview.y);
      ctx.lineTo(preview.targetX, preview.targetY);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Clear all balls
  clearBalls() {
    this.balls = [];
    this.sparks = [];
    this.ripples = [];
  }

  // Clear everything
  clearAll() {
    this.balls = [];
    this.emitters = [];
    this.bells = [];
    this.strings = [];
    this.gravityWells = [];
    this.portals = [];
    this.sparks = [];
    this.ripples = [];
    this.selectedItem = null;
    this.radar.enabled = false;
  }

  // Export scene to serializable JSON
  exportScene() {
    return {
      version: '1.0',
      bpm: this.bpm,
      gravity: this.gravity,
      friction: this.friction,
      elasticity: this.elasticity,
      radar: { ...this.radar, triggeredNodes: [] },
      emitters: this.emitters.map(({ id, x, y, angle, speed, intervalBeats, ballColor, ballLife, active, radius }) => ({
        id, x, y, angle, speed, intervalBeats, ballColor, ballLife, active, radius
      })),
      bells: this.bells.map(({ id, x, y, radius, noteIndex, noteLabel, color }) => ({
        id, x, y, radius, noteIndex, noteLabel, color
      })),
      strings: this.strings.map(({ id, x1, y1, x2, y2, color }) => ({
        id, x1, y1, x2, y2, color
      })),
      gravityWells: this.gravityWells.map(({ id, x, y, strength, radius }) => ({
        id, x, y, strength, radius
      })),
      portals: this.portals.map(({ id, x, y, radius, angle, color }) => ({
        id, x, y, radius, angle, color
      })),
    };
  }

  // Load scene from JSON
  loadScene(data) {
    if (!data) return;
    this.clearAll();
    this.bpm = data.bpm || 120;
    if (data.gravity) this.gravity = data.gravity;
    if (data.friction) this.friction = data.friction;
    if (data.elasticity) this.elasticity = data.elasticity;

    if (data.radar) {
      this.radar = {
        ...this.radar,
        enabled: !!data.radar.enabled,
        x: data.radar.x ?? this.width / 2,
        y: data.radar.y ?? this.height / 2,
        radius: data.radar.radius ?? 260,
        speed: data.radar.speed ?? 0.02,
        triggeredNodes: new Set(),
      };
    }

    this.emitters = (data.emitters || []).map((e) => ({
      ...e,
      id: e.id || getNextId(),
      radius: e.radius || 16,
      active: e.active !== false,
      lastFired: 0,
    }));

    this.bells = (data.bells || []).map((b) => ({
      ...b,
      id: b.id || getNextId(),
      radius: b.radius || 22,
      glow: 0,
    }));

    this.strings = (data.strings || []).map((s) => ({
      ...s,
      id: s.id || getNextId(),
      vibration: null,
    }));

    this.gravityWells = (data.gravityWells || []).map((g) => ({
      ...g,
      id: g.id || getNextId(),
      radius: g.radius || 45,
    }));

    this.portals = (data.portals || []).map((p) => ({
      ...p,
      id: p.id || getNextId(),
      radius: p.radius || 24,
    }));
  }
}
