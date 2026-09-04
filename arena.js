/*
 * arena.js — el fondo del menu principal de Crystalysis, en la web.
 *
 * Lo comparten la landing y el press kit para que no puedan divergir. Y lo que dibuja NO es
 * una rejilla: el menu del juego es un campo de triangulos EN CONTORNO a la deriva, de
 * tamanos y giros distintos, sobre negro. La rejilla es del interior de la arena, otra
 * pantalla. Copiar la pantalla equivocada fue el primer error de esta pagina.
 *
 *   Arena(canvas, { chase, density, gem })
 *     chase   — si los triangulos persiguen al puntero (el puntero hace de bola)
 *     density — triangulos por cada 100.000 px^2 de lienzo
 *     gem     — elemento del DOM en cuyo centro se dibuja el cristal, o null
 */
(function (global) {
  "use strict";

  function Arena(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var chase = opts.chase !== false;
    var density = opts.density || 26;
    var gemEl = opts.gem || null;
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    var W = 0, H = 0, DPR = 1;
    var gem = { x: 0, y: 0, r: 0, on: false };
    var tris = [];
    var ball = { x: -999, y: -999, on: false, trail: [] };
    var crystal = { broken: false, t: 0, shards: [], hit: 0 };
    var running = true, interacted = false;

    function layout() {
      DPR = Math.min(devicePixelRatio || 1, 2);
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (gemEl) {
        var g = gemEl.getBoundingClientRect();
        gem.on = true;
        gem.x = g.left + g.width / 2 - r.left;
        gem.y = g.top + g.height / 2 - r.top;
        gem.r = Math.max(24, Math.min(46, g.width * 0.26));
      }
      var want = Math.max(10, Math.round(W * H / 100000 * density));
      while (tris.length < want) tris.push(make(true));
      tris.length = Math.min(tris.length, want);
    }

    function make(seeded) {
      var t = {
        x: 0, y: 0, vx: 0, vy: 0,
        sz: 5 + Math.random() * 13,          // el menu mezcla tamanos muy distintos
        rot: Math.random() * 6.283,
        vr: (Math.random() - 0.5) * 0.006,
        drift: Math.random() * 6.283
      };
      t.vx = Math.cos(t.drift) * 0.12;
      t.vy = Math.sin(t.drift) * 0.12;
      if (seeded) { t.x = Math.random() * W; t.y = Math.random() * H; return t; }
      var side = (Math.random() * 4) | 0, m = 30;
      if (side === 0) { t.x = Math.random() * W; t.y = -m; }
      else if (side === 1) { t.x = W + m; t.y = Math.random() * H; }
      else if (side === 2) { t.x = Math.random() * W; t.y = H + m; }
      else { t.x = -m; t.y = Math.random() * H; }
      return t;
    }

    // ── Puntero ──────────────────────────────────────────────────────────────────────────
    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      ball.x = e.clientX - r.left; ball.y = e.clientY - r.top;
      ball.on = ball.x > -40 && ball.x < W + 40 && ball.y > -40 && ball.y < H + 40;
      if (ball.on) interacted = true;
    }
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onMove, { passive: true });
    document.addEventListener('pointerleave', function () { ball.on = false; });

    // ── El cristal se rompe y eclosiona en estrella ───────────────────────────────────────
    function breakGem() {
      interacted = true;
      if (crystal.broken) { crystal.broken = false; crystal.t = 0; return; }
      crystal.broken = true; crystal.t = 0; crystal.shards = [];
      for (var i = 0; i < 18; i++) {
        var a = (i / 18) * 6.283 + Math.random() * 0.4, s = 1.7 + Math.random() * 3;
        crystal.shards.push({
          x: gem.x, y: gem.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          rot: Math.random() * 6.283, vr: (Math.random() - 0.5) * 0.24,
          sz: 3 + Math.random() * 5, life: 1
        });
      }
    }
    if (gemEl) {
      gemEl.addEventListener('click', breakGem);
      gemEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); breakGem(); }
      });
    }

    // ── Dibujo ───────────────────────────────────────────────────────────────────────────
    function drawTris() {
      var huyen = chase && gem.on && crystal.broken && !ball.on;
      var pull = chase && (ball.on || huyen);
      var tx = ball.on ? ball.x : gem.x;
      var ty = ball.on ? ball.y : gem.y;
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = 'rgba(150,164,175,.42)';
      for (var i = 0; i < tris.length; i++) {
        var t = tris[i];
        if (pull) {
          var dx = tx - t.x, dy = ty - t.y;
          if (huyen) { dx = -dx; dy = -dy; }
          var d = Math.hypot(dx, dy) || 1;
          t.vx += (dx / d) * 0.05 + (Math.random() - 0.5) * 0.02;
          t.vy += (dy / d) * 0.05 + (Math.random() - 0.5) * 0.02;
          var sp = Math.hypot(t.vx, t.vy);
          if (sp > 1.45) { t.vx = t.vx / sp * 1.45; t.vy = t.vy / sp * 1.45; }
          t.rot = Math.atan2(t.vy, t.vx) + 1.5708;   // apuntan a donde van
        } else {
          t.rot += t.vr;
        }
        if (!reduced) { t.x += t.vx; t.y += t.vy; }

        if (ball.on && Math.hypot(ball.x - t.x, ball.y - t.y) < 16) { tris[i] = make(false); continue; }
        if (pull && gem.on && !crystal.broken && Math.hypot(gem.x - t.x, gem.y - t.y) < gem.r * 1.3) {
          crystal.hit = 1; tris[i] = make(false); continue;
        }
        if (t.x < -140 || t.x > W + 140 || t.y < -140 || t.y > H + 140) { tris[i] = make(false); continue; }

        ctx.save();
        ctx.translate(t.x, t.y); ctx.rotate(t.rot);
        ctx.beginPath();
        ctx.moveTo(0, -t.sz);
        ctx.lineTo(t.sz * 0.88, t.sz * 0.72);
        ctx.lineTo(-t.sz * 0.88, t.sz * 0.72);
        ctx.closePath(); ctx.stroke();       // CONTORNO, no relleno: como en el menu
        ctx.restore();
      }
    }

    function drawGem(time) {
      if (!gem.on) return;
      var R = gem.r;
      var glow = ctx.createRadialGradient(gem.x, gem.y, R * 0.3, gem.x, gem.y, R * 2.8);
      glow.addColorStop(0, crystal.broken ? 'rgba(244,203,110,.26)' : 'rgba(89,217,242,.28)');
      glow.addColorStop(1, 'rgba(10,13,17,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(gem.x, gem.y, R * 2.8, 0, 6.2832); ctx.fill();

      if (!crystal.broken) {
        var br = 1 + (reduced ? 0 : Math.sin(time / 620) * 0.03);
        ctx.save(); ctx.translate(gem.x, gem.y); ctx.rotate(0.7854); ctx.scale(br, br);
        var g = ctx.createLinearGradient(0, -R, 0, R);
        g.addColorStop(0, '#9DF5FF'); g.addColorStop(0.5, '#59D9F2'); g.addColorStop(1, '#2FA9C4');
        ctx.fillStyle = g;
        ctx.fillRect(-R * 0.72, -R * 0.72, R * 1.44, R * 1.44);
        ctx.restore();
        // El punto blanco del centro: en el menu es un circulo limpio, sin cuadro interior.
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(gem.x, gem.y, R * 0.19, 0, 6.2832); ctx.fill();

        if (crystal.hit > 0) {
          ctx.strokeStyle = 'rgba(240,82,62,' + (crystal.hit * 0.5).toFixed(3) + ')';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(gem.x, gem.y, R * (1.2 + (1 - crystal.hit) * 0.9), 0, 6.2832);
          ctx.stroke();
          crystal.hit -= 0.12;
        }
        if (!interacted && !reduced) {
          var p = (time % 1900) / 1900;
          ctx.strokeStyle = 'rgba(89,217,242,' + ((1 - p) * 0.5).toFixed(3) + ')';
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(gem.x, gem.y, R * (1.15 + p * 1.5), 0, 6.2832); ctx.stroke();
        }
      } else {
        for (var i = 0; i < crystal.shards.length; i++) {
          var s = crystal.shards[i];
          if (s.life <= 0) continue;
          s.x += s.vx; s.y += s.vy; s.vx *= 0.965; s.vy *= 0.965;
          s.rot += s.vr; s.life -= 0.016;
          ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot);
          ctx.fillStyle = 'rgba(89,217,242,' + Math.max(0, s.life * 0.85).toFixed(3) + ')';
          ctx.fillRect(-s.sz / 2, -s.sz / 2, s.sz, s.sz);
          ctx.restore();
        }
        var g2 = Math.min(1, crystal.t / 40), R2 = R * (0.5 + g2 * 0.95);
        ctx.save(); ctx.translate(gem.x, gem.y); ctx.rotate(reduced ? 0 : time / 2600);
        var sg = ctx.createRadialGradient(0, 0, 0, 0, 0, R2);
        sg.addColorStop(0, '#FFF3D0'); sg.addColorStop(1, '#F4CB6E');
        ctx.fillStyle = sg; ctx.globalAlpha = g2;
        ctx.beginPath();
        for (var k = 0; k < 10; k++) {
          var rr = k % 2 ? R2 * 0.44 : R2, a = (k / 10) * 6.2832 - 1.5708;
          if (k) ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
          else ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1; ctx.restore();
      }
    }

    function drawBall() {
      if (!ball.on) { ball.trail.length = 0; return; }
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 16) ball.trail.shift();
      ctx.lineCap = 'round';
      for (var i = 1; i < ball.trail.length; i++) {
        var a = i / ball.trail.length;
        ctx.strokeStyle = 'rgba(169,107,240,' + (a * 0.55).toFixed(3) + ')';
        ctx.lineWidth = a * 9;
        ctx.beginPath();
        ctx.moveTo(ball.trail[i - 1].x, ball.trail[i - 1].y);
        ctx.lineTo(ball.trail[i].x, ball.trail[i].y);
        ctx.stroke();
      }
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(ball.x, ball.y, 7, 0, 6.2832); ctx.fill();
    }

    function frame(time) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      drawTris();
      if (crystal.broken) crystal.t++;
      drawGem(time);
      drawBall();
      requestAnimationFrame(frame);
    }

    addEventListener('resize', layout);
    addEventListener('scroll', layout, { passive: true });
    document.addEventListener('visibilitychange', function () {
      var was = !running;
      running = !document.hidden;
      if (running && was) requestAnimationFrame(frame);
    });

    // ⚠ layout() ANTES de sembrar: con W y H a cero salen todos apilados en la esquina.
    layout();
    requestAnimationFrame(frame);

    return { relayout: layout, hasInteracted: function () { return interacted; } };
  }

  global.Arena = Arena;
})(window);
