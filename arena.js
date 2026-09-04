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
    var affordance = opts.affordance !== false;
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    var W = 0, H = 0, DPR = 1;
    var gem = { x: 0, y: 0, r: 0, on: false };
    var tris = [];
    var ball = { x: -999, y: -999, on: false, trail: [] };
    var crystal = { broken: false, t: 0, shards: [] };
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
        gem.r = g.width * 0.46;   // el rombo llena su caja: semidiagonal = 0,46 del ancho
      }
      var want = Math.max(10, Math.round(W * H / 100000 * density));
      while (tris.length < want) tris.push(make(true));
      tris.length = Math.min(tris.length, want);
    }

    function gemR() { return gem.r || 30; }

    function make(seeded) {
      var t = {
        x: 0, y: 0, vx: 0, vy: 0,
        sz: 5 + Math.random() * 13,          // el menu mezcla tamanos muy distintos
        rot: Math.random() * 6.283,
        vr: (Math.random() - 0.5) * 0.006,
        drift: Math.random() * 6.283,
        // Orbita propia: radio y sentido. Sin radios distintos los 30 caerian en el mismo
        // anillo y se leeria como una rueda dentada, no como una horda rodeando algo.
        orbita: 0,
        giro: (Math.random() < 0.5 ? -1 : 1) * (0.55 + Math.random() * 0.75)
      };
      var lejos = Math.hypot(W, H) / 2;
      t.orbita = Math.max(60, (gemR() * 1.7) + Math.random() * (lejos * 0.72));
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
        } else if (gem.on) {
          // ORBITAN el cristal. Velocidad tangencial mas una correccion radial suave hacia su
          // propio radio: el que entra por un borde espirala hasta su orbita en vez de
          // aparecer ya colocado, y ninguno llega al centro.
          var ox = t.x - gem.x, oy = t.y - gem.y;
          var od = Math.hypot(ox, oy) || 1;
          var ux = ox / od, uy = oy / od;
          var err = (t.orbita - od) * 0.006;
          t.vx = -uy * t.giro + ux * err;
          t.vy =  ux * t.giro + uy * err;
          t.rot = Math.atan2(t.vy, t.vx) + 1.5708;
        } else {
          t.rot += t.vr;
        }
        if (!reduced) { t.x += t.vx; t.y += t.vy; }

        if (ball.on && Math.hypot(ball.x - t.x, ball.y - t.y) < 16) { tris[i] = make(false); continue; }
        if (pull && gem.on && !crystal.broken && Math.hypot(gem.x - t.x, gem.y - t.y) < gem.r * 1.3) {
          tris[i] = make(false); continue;
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

    // ── El cristal, con la geometria del juego ───────────────────────────────────────────
    //
    // No es un cuadrado girado con un degradado: son CUATRO PLACAS pegadas por las dos
    // diagonales, cada una con su propia luz (HomeGemElement.FacetBias), y un hueco central
    // con luz dentro. Eso es lo que hace que una pieza plana se lea como tallada — mi version
    // anterior era una aproximacion y se notaba.
    //
    // Unidades del juego: radio 50. Aqui se escala por gem.r/50.
    var FACETAS = ['#70DEF3', '#54CCE3', '#5AD1E8', '#7BE0F4'];
    var REST_HOLE = 13.95, REST_CORE = 8.43;       // el hueco y su luz, pieza cerrada
    var PLATE_SLIDE = 24;                          // cuanto se retira cada placa al abrirse
    var STAR_OUT = 40, STAR_IN = 12.02;            // StarRadii: CUATRO puntas, no cinco
    var STAR_HOLE = 11, STAR_CORE = 6.6;           // el hueco y el nucleo con la estrella fuera
    var RAY_FROM = 30, RAY_TO = 88, RAY_HALF = 3.4, RAY_TIP = 0.2;
    var BORDE_CLARO = '#EAF2F6';                   // --home-gem-star
    var BORDE_SOMBRA = '#B9EAF5';                  // lerp(estrella, cara, StarFacetShade 0,34)
    var CARA = [89, 217, 242];                     // --cian
    var VACIO = [10, 13, 17];                      // --home-gem-void  (--surface-0)
    var ESTRELLA = [234, 242, 246];                // --home-gem-star  (--texto-1), blanca

    function mix(a, b, t) {
      return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' +
                      Math.round(a[1] + (b[1] - a[1]) * t) + ',' +
                      Math.round(a[2] + (b[2] - a[2]) * t) + ')';
    }


    function drawGem(time) {
      if (!gem.on) return;
      var R = gem.r, u = R / 50;                   // u = la unidad del juego, en px
      var a = crystal.broken ? Math.min(1, crystal.t / 46) : 0;      // apertura 0..1
      var star = Math.max(0, Math.min(1, (a - 0.08) / 0.55));        // StarAppearsAt/Over
      var sc = (0.28 + 0.72 * a);                                    // StarScale

      var glow = ctx.createRadialGradient(gem.x, gem.y, R * 0.3, gem.x, gem.y, R * 2.8);
      glow.addColorStop(0, star > 0.3 ? 'rgba(244,203,110,.20)' : 'rgba(89,217,242,.28)');
      glow.addColorStop(1, 'rgba(10,13,17,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(gem.x, gem.y, R * 2.8, 0, 6.2832); ctx.fill();

      ctx.save();
      ctx.translate(gem.x, gem.y);

      // ── La concha: cuatro placas que se retiran EN LINEA RECTA sobre su bisectriz ──────
      var V = [[0, -50], [50, 0], [0, 50], [-50, 0]];
      var desliz = a * PLATE_SLIDE * u;
      var fuera = Math.max(0, (a - 0.86) / 0.14);       // ShellLeavesFrom
      if (fuera < 1) {
        ctx.globalAlpha = 1 - fuera;
        for (var k = 0; k < 4; k++) {
          var ang = -0.7854 + k * 1.5708;
          ctx.save();
          ctx.translate(Math.cos(ang) * desliz, Math.sin(ang) * desliz);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(V[k][0] * u, V[k][1] * u);
          ctx.lineTo(V[(k + 1) % 4][0] * u, V[(k + 1) % 4][1] * u);
          ctx.closePath();
          ctx.fillStyle = FACETAS[k];
          ctx.fill();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }

      // ── La estrella: ABANICO de ocho cunas, no ocho triangulos planos ─────────────────
      // Cada cuna va de BLANCO PURO en el centro al color de su borde, y los bordes
      // alternan claro / tenido hacia el cristal (StarFacetShade 0,34). Eso es lo que la
      // hace leerse tallada, del mismo material que la concha de la que sale; plana era
      // una silueta blanca recortada.
      if (star > 0.001) {
        var rim = [];
        for (var i = 0; i < 8; i++) {
          var ai = -1.5708 + i * 0.7854;
          var ri = (i % 2 ? STAR_IN : STAR_OUT) * sc * u;
          rim.push([Math.cos(ai) * ri, Math.sin(ai) * ri, ri]);
        }
        ctx.globalAlpha = star;
        for (var i = 0; i < 8; i++) {
          var p0 = rim[i], p1 = rim[(i + 1) % 8];
          var rmax = Math.max(p0[2], p1[2]) || 1;
          var g = ctx.createRadialGradient(0, 0, 0, 0, 0, rmax);
          g.addColorStop(0, '#FFFFFF');                                  // el brillo del centro
          g.addColorStop(1, (i % 2 === 0) ? BORDE_CLARO : BORDE_SOMBRA);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
          ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // ── El hueco y la luz. SIEMPRE opacos ────────────────────────────────────────────
      // No se funden: un oscuro medio transparente sobre el cian de las placas da azul, y
      // ese era el "a veces el centro se pone azul y es raro". Lo que se interpola es el
      // RADIO; la tinta no se toca.
      var hole = REST_HOLE + (STAR_HOLE * sc - REST_HOLE) * star;
      var core = REST_CORE + (STAR_CORE * sc - REST_CORE) * star;
      ctx.fillStyle = 'rgb(10,13,17)';
      ctx.beginPath(); ctx.arc(0, 0, hole * u, 0, 6.2832); ctx.fill();
      // Con la estrella fuera el nucleo es AMBAR (--home-gem-ready); cerrado, blanco.
      ctx.fillStyle = star > 0.5 ? '#F4CB6E' : '#EAF2F6';
      ctx.beginPath(); ctx.arc(0, 0, core * u, 0, 6.2832); ctx.fill();

      // ── Los cuatro rayos del estado abierto ──────────────────────────────────────────
      // ⚠ Arrancan FUERA de la estrella (RayFrom 30), no en el centro: naciendo en el
      // centro sus cuatro bases se cruzan sobre el nucleo y dejan una equis clarita.
      if (star > 0.99) {
        for (var k = 0; k < 4; k++) {
          var ra = 0.7854 + k * 1.5708;
          var dx = Math.cos(ra), dy = Math.sin(ra);
          var sx = -dy * RAY_HALF * u, sy = dx * RAY_HALF * u;
          var b = RAY_FROM * u, t = RAY_TO * u;
          var rg = ctx.createLinearGradient(dx * b, dy * b, dx * t, dy * t);
          rg.addColorStop(0, 'rgba(89,217,242,.16)');
          rg.addColorStop(1, 'rgba(89,217,242,0)');
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.moveTo(dx * b + sx, dy * b + sy);
          ctx.lineTo(dx * b - sx, dy * b - sy);
          ctx.lineTo(dx * t - sx * RAY_TIP, dy * t - sy * RAY_TIP);
          ctx.lineTo(dx * t + sx * RAY_TIP, dy * t + sy * RAY_TIP);
          ctx.closePath(); ctx.fill();
        }
      }
      ctx.restore();

      if (affordance && !interacted && !reduced && !crystal.broken) {
        var pp = (time % 1900) / 1900;
        ctx.strokeStyle = 'rgba(89,217,242,' + ((1 - pp) * 0.22).toFixed(3) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(gem.x, gem.y, R * (1.55 + pp * 1.4), 0, 6.2832); ctx.stroke();
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
