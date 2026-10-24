/*
 * HFB — HyperFrames motion blocks (house library). Each block builds DOM synchronously and adds its
 * tweens to YOUR paused timeline at `at`, so the film stays one seekable, deterministic timeline.
 * Learned from studio anthem films (Oddfellows × Figma "Design is dead?"): every block is one motion idea.
 *
 *   pixelReveal  image dissolves in as blocks, then sharpens 48px → 1px (the "loading reality" look)
 *   typeLines    code/text typed per character, with a caret            counter   ticking numerals
 *   tunnel       fly-through of nested frames (zoom-through transition)
 *   blobChain    rounded blocks following a curve with lag (weighty, organic travel)
 *   kaleido      8-fold symmetric pattern grown ring by ring from ONE cell; palette swaps on beats
 *   stickerBurst collage of flat shapes bursting from a point; .collapse(at) pulls them back
 *   chars        split text into .ch spans for per-glyph motion
 *
 * Rules: no Math.random (use HFB.rng(seed)), no timers, everything seekable from onUpdate state.
 */
(function () {
  const HFB = {};
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  HFB.rng = (seed = 1) => { let s = (seed >>> 0) % 2147483647 || 1; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; };
  HFB.shuffle = (arr, rnd) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  HFB.chars = (el) => { el.innerHTML = [...el.textContent].map((c) => `<span class="ch" style="display:inline-block">${c === ' ' ? '&nbsp;' : c}</span>`).join(''); return [...el.querySelectorAll('.ch')]; };
  const mk = (tag, cls, parent, css) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); parent && parent.append(e); return e; };

  /** Pixel/dither reveal of an <img> into a <canvas>. Phase 1: cells appear in seeded order with a
   *  sparkle front; phase 2: resolution steps up. Optional `out` reverses it (dissolve away). */
  HFB.pixelReveal = (tl, { canvas, img, at = 0, dur = 1.8, cell = 48, seed = 3, steps = [48, 32, 20, 12, 7, 4, 2, 1], sparkle = '#ffffff', out = false }) => {
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    const cols = Math.ceil(W / cell), rows = Math.ceil(H / cell), n = cols * rows, rnd = HFB.rng(seed);
    // Order: noisy radial from a seeded focus, so it grows like a stain, not uniform noise.
    const fx = cols * (0.3 + rnd() * 0.4), fy = rows * (0.3 + rnd() * 0.4);
    const rank = new Float32Array(n);
    [...Array(n).keys()].map((i) => [i, Math.hypot((i % cols) - fx, Math.floor(i / cols) - fy) + rnd() * 4]).sort((a, b) => a[1] - b[1]).forEach(([i], r) => (rank[i] = r / n));
    const low = document.createElement('canvas'), lctx = low.getContext('2d');
    const st = { p: out ? 1 : 0 };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (!img.complete || !img.naturalWidth || st.p <= 0) return;
      const a = clamp(st.p / 0.5), r = clamp((st.p - 0.4) / 0.6);
      const px = steps[Math.min(steps.length - 1, Math.floor(r * steps.length))];
      low.width = Math.max(1, Math.ceil(W / px)); low.height = Math.max(1, Math.ceil(H / px));
      const s = Math.max(W / img.naturalWidth, H / img.naturalHeight), sw = W / s, sh = H / s;
      lctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, low.width, low.height);
      ctx.imageSmoothingEnabled = false;
      if (a >= 1) { ctx.drawImage(low, 0, 0, W, H); return; }
      for (let i = 0; i < n; i++) {
        const x = (i % cols) * cell, y = Math.floor(i / cols) * cell;
        if (rank[i] < a) ctx.drawImage(low, x / px, y / px, cell / px, cell / px, x, y, cell, cell);
        else if (rank[i] < a + 0.06) { ctx.fillStyle = sparkle; for (let k = 0; k < 4; k++) ctx.fillRect(x + ((i * 7 + k * 13) % cell), y + ((i * 11 + k * 5) % cell), 4, 4); }
      }
    };
    draw();
    tl.to(st, { p: out ? 0 : 1, duration: dur, ease: out ? 'power1.out' : 'power1.inOut', onUpdate: draw }, at);
    return { draw };
  };

  /** Type lines of mono text into `el`, `cps` characters per second, with a block caret. */
  HFB.typeLines = (tl, { el, lines, at = 0, cps = 38 }) => {
    const rows = lines.map((l) => mk('div', 'hfb-line', el)), caret = mk('span', 'hfb-caret', null, { display: 'inline-block', width: '0.6em', height: '1em', background: 'currentColor', verticalAlign: '-0.12em', marginLeft: '2px' });
    const total = lines.join('').length, st = { c: 0 };
    const draw = () => {
      let left = Math.round(st.c);
      rows.forEach((r, i) => { const k = clamp(left, 0, lines[i].length); r.textContent = lines[i].slice(0, k); left -= lines[i].length; if (k > 0 && (k < lines[i].length || i === lines.length - 1)) r.append(caret); });
    };
    draw();
    tl.to(st, { c: total, duration: total / cps, ease: 'none', onUpdate: draw }, at);
  };

  HFB.counter = (tl, { el, from = 0, to = 100, at = 0, dur = 1.2, pad = 2, decimals = 0, ease = 'power2.out' }) => {
    const st = { v: from }, draw = () => (el.textContent = st.v.toFixed(decimals).padStart(pad, '0'));
    draw(); tl.to(st, { v: to, duration: dur, ease, onUpdate: draw }, at);
  };

  /** Fly-through of `n` nested frames inside `el` (position:absolute; inset:0). Each frame carries a mono label. */
  HFB.tunnel = (tl, { el, n = 9, at = 0, dur = 1.4, depth = 3, color = '#e9e9e9', labels = [] }) => {
    const frames = [...Array(n)].map((_, i) => { const f = mk('div', 'hfb-frame', el, { position: 'absolute', left: '50%', top: '50%', width: '1600px', height: '900px', margin: '-450px 0 0 -800px', border: `3px solid ${color}`, opacity: 0, display: 'none' }); if (labels[i % (labels.length || 1)]) mk('b', '', f, { position: 'absolute', left: '18px', top: '10px', font: '600 26px var(--mono, monospace)', color }).textContent = labels[i % labels.length]; return f; });
    const st = { z: 0 };
    const draw = () => frames.forEach((f, i) => { const k = i - st.z * depth; const s = Math.pow(0.62, k); f.style.transform = `scale(${s})`; f.style.opacity = k < -0.6 ? 0 : clamp(1.4 - k * 0.12) * clamp(k + 0.6); });
    tl.set(frames, { display: 'block' }, at);
    tl.to(st, { z: 1, duration: dur, ease: 'expo.in', onUpdate: draw, onStart: draw }, at);
    tl.set(frames, { opacity: 0, display: 'none' }, at + dur);
  };

  /** Chain of rounded blocks travelling a Catmull-Rom curve through `pts` (in px). Leader is biggest. */
  HFB.blobChain = (tl, { svg, pts, n = 10, at = 0, dur = 2.4, lag = 0.045, size = 150, fill = '#0b0b0f', stroke = '#9bb7ff', ease = 'power2.inOut' }) => {
    const NS = 'http://www.w3.org/2000/svg';
    const seg = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return [0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)); };
    const P = [pts[0], ...pts, pts[pts.length - 1]];
    const at_ = (u) => { u = clamp(u) * (pts.length - 1); const i = Math.min(pts.length - 2, Math.floor(u)); return seg(P[i], P[i + 1], P[i + 2], P[i + 3], u - i); };
    const blocks = [...Array(n)].map((_, i) => { const sz = size * (1 - i * 0.6 / n); const r = document.createElementNS(NS, 'rect'); Object.entries({ width: sz, height: sz, x: -sz / 2, y: -sz / 2, rx: sz * 0.28, fill, stroke, 'stroke-width': 8 }).forEach(([k, v]) => r.setAttribute(k, v)); svg.prepend(r); return r; });
    const st = { p: 0 };
    const draw = () => blocks.forEach((b, i) => { const u = st.p * (1 + lag * n) - i * lag; const [x, y] = at_(u), [x2, y2] = at_(u + 0.01); const ang = Math.atan2(y2 - y, x2 - x) * 57.3; b.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(ang * 0.35).toFixed(1)}) scale(${u <= 0 ? 0 : clamp(u * 12)})`); });
    draw(); tl.to(st, { p: 1, duration: dur, ease, onUpdate: draw }, at);
    return { blocks };
  };

  /** Symmetric pattern on a grid, grown from the centre cell. Colours are CSS vars --k0..--k3 on `el`,
   *  so `swap(at, palette)` recolours the whole system in one tween; cells pulse outward on each swap. */
  HFB.kaleido = (tl, { el, cols = 23, rows = 13, cell = 92, at = 0, dur = 2.2, seed = 11, palette }) => {
    // `el` is the whole scene (inset:0). --k0 is its background, --k1..--k3 the cells.
    const rnd = HFB.rng(seed), memo = new Map();
    const shapes = ['circle', 'square', 'round', 'plus', 'ring', 'dot', 'none', 'circle', 'round'];
    const pick = (a, b) => { const k = a + ',' + b; if (!memo.has(k)) memo.set(k, [shapes[Math.floor(rnd() * shapes.length)], 1 + Math.floor(rnd() * 3)]); return memo.get(k); };
    const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
    palette.forEach((c, i) => el.style.setProperty('--k' + i, c));
    el.style.background = 'var(--k0)';
    const grid = mk('div', 'hfb-kgrid', el, { position: 'absolute', left: '50%', top: '50%', width: cols * cell + 'px', height: rows * cell + 'px', margin: `${-rows * cell / 2}px 0 0 ${-cols * cell / 2}px` });
    const cells = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const dx = Math.abs(x - cx), dy = Math.abs(y - cy), a = Math.min(dx, dy), b = Math.max(dx, dy);
      const [shape, ci] = x === cx && y === cy ? ['plus', 3] : pick(a, b);
      if (shape === 'none') continue;
      const c = mk('i', 'hfb-cell', grid, { position: 'absolute', left: x * cell + 'px', top: y * cell + 'px', width: cell + 'px', height: cell + 'px', background: `var(--k${ci})` });
      const S = { circle: { borderRadius: '50%' }, square: {}, round: { borderRadius: '28%' }, dot: { borderRadius: '50%', clipPath: 'circle(21% at 50% 50%)' }, ring: { borderRadius: '50%', background: 'transparent', border: `${cell * 0.2}px solid var(--k${ci})` }, plus: { clipPath: 'polygon(33% 0,67% 0,67% 33%,100% 33%,100% 67%,67% 67%,67% 100%,33% 100%,33% 67%,0 67%,0 33%,33% 33%)' } }[shape];
      Object.assign(c.style, S); c.dataset.d = Math.hypot(dx, dy * 1.1).toFixed(2); cells.push(c);
    }
    const maxD = Math.max(...cells.map((c) => +c.dataset.d));
    const delay = (i, c) => (+c.dataset.d / maxD) * (dur - 0.7);
    tl.from(cells, { scale: 0, rotation: (i) => (i % 2 ? 90 : -90), duration: 0.7, ease: 'back.out(1.8)', stagger: delay }, at);
    return {
      grid, cells,
      swap: (t, pal, { pulse = 0.55 } = {}) => {
        tl.to(el, Object.assign(Object.fromEntries(pal.map((c, i) => ['--k' + i, c])), { duration: 0.5, ease: 'power2.inOut' }), t);
        tl.to(cells, { keyframes: [{ scale: pulse, duration: 0.22, ease: 'power2.in' }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }], stagger: (i, c) => (+c.dataset.d / maxD) * 0.6 }, t - 0.15);
      },
    };
  };

  /** Collage burst: n flat stickers fly out from (ox, oy) to seeded spots across W×H. */
  HFB.stickerBurst = (tl, { el, n = 42, at = 0, seed = 5, palette, W = 1920, H = 1080, ox = W / 2, oy = H / 2, glyphs = '' }) => {
    // glyphs: optional letters as stickers (they count as text for `hf check`; keep them few, or leave empty).
    const rnd = HFB.rng(seed), items = [];
    const kinds = ['circle', 'pill', 'round', 'tri', 'star', 'half', 'dots', 'stripes', 'ring', 'arch'].concat(glyphs ? ['glyph'] : []);
    for (let i = 0; i < n; i++) {
      const k = kinds[Math.floor(rnd() * kinds.length)], s = 70 + rnd() * 220, c = palette[Math.floor(rnd() * palette.length)], c2 = palette[Math.floor(rnd() * palette.length)];
      const e = mk('div', 'hfb-sticker', el, { position: 'absolute', left: ox - s / 2 + 'px', top: oy - s / 2 + 'px', width: s + 'px', height: (k === 'pill' ? s * 0.45 : s) + 'px', background: c, display: 'grid', placeItems: 'center' });
      ({
        circle: () => (e.style.borderRadius = '50%'), pill: () => (e.style.borderRadius = '999px'), round: () => (e.style.borderRadius = '24%'),
        tri: () => (e.style.clipPath = 'polygon(50% 4%,96% 92%,4% 92%)'), half: () => (e.style.borderRadius = `${s}px ${s}px 0 0`),
        star: () => (e.style.clipPath = 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'),
        dots: () => { e.style.background = `radial-gradient(circle, ${c2} 28%, transparent 30%) 0 0/ ${s / 4}px ${s / 4}px, ${c}`; e.style.borderRadius = '18%'; },
        stripes: () => (e.style.background = `repeating-linear-gradient(90deg, ${c} 0 ${s / 10}px, ${c2} ${s / 10}px ${s / 5}px)`),
        ring: () => { e.style.background = 'transparent'; e.style.border = `${s * 0.16}px solid ${c}`; e.style.borderRadius = '50%'; },
        glyph: () => { e.style.background = 'transparent'; e.style.color = c; e.style.font = `900 ${s}px/1 var(--display, sans-serif)`; e.textContent = glyphs[Math.floor(rnd() * glyphs.length)]; },
        arch: () => { e.style.borderRadius = `${s / 2}px ${s / 2}px 8px 8px`; e.style.background = `linear-gradient(${c} 50%, ${c2} 50%)`; },
      })[k]();
      const ang = rnd() * Math.PI * 2, rad = 0.25 + rnd() * 0.75;
      items.push({ e, x: Math.cos(ang) * rad * W * 0.55, y: Math.sin(ang) * rad * H * 0.55, r: (rnd() - 0.5) * 70 });
    }
    const order = HFB.shuffle(items, rnd);
    order.forEach((it, i) => tl.fromTo(it.e, { x: 0, y: 0, scale: 0, rotation: it.r - 120 }, { x: it.x, y: it.y, scale: 1, rotation: it.r, duration: 0.9, ease: 'back.out(1.5)' }, at + i * 0.018));
    return {
      items,
      drift: (t, d) => items.forEach((it, i) => tl.to(it.e, { x: it.x * 1.08, y: it.y * 1.08, rotation: it.r + (i % 2 ? 8 : -8), duration: d, ease: 'none' }, t)),
      collapse: (t, d = 0.7) => tl.to(items.map((it) => it.e), { x: 0, y: 0, scale: 0, rotation: 0, duration: d, ease: 'expo.in', stagger: 0.008 }, t),
    };
  };

  /** Time-warp: author the film in comfortable "design time", then fit each beat to the VOICE. design and real are
   *  matching beat-start arrays (last item = end). Returns the timeline to register on window.__timelines.
   *  Use with vo-direct.sh (lines.json/phrases.json): real[i] = phrase start - 0.25 s, so the picture leads the word and never waits for it. */
  HFB.warp = (inner, design, real) => {
    inner.pause(0);
    const outer = gsap.timeline({ paused: true });
    for (let i = 0; i < design.length - 1; i++)
      outer.fromTo(inner, { time: design[i] }, { time: design[i + 1], duration: real[i + 1] - real[i], ease: 'none', immediateRender: false }, real[i]);
    return outer;
  };

  window.HFB = HFB;
})();
