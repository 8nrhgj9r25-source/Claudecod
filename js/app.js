/* Browine — app logic & motion graphics */
(function () {
  'use strict';

  const { DRINKS, CHARACTERS, CHALLENGES, LIMITED, TIPS } = window.Data;
  const A = window.Art;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= State ================= */
  const KEY = 'browine:v1';
  const DEFAULT = {
    goal: 2210, profile: { weight: 70, activity: 1, weather: 1 },
    entries: [], day: null, streak: 0, lastGoalDay: null, history: {},
    unlocked: [0], char: 0, units: 'ml', resetHour: 0, kcal: false, hidden: [],
    setup: { reminders: false, widget: false, goal: false, dismissed: false },
    reminders: { on: false, every: 120, last: 0 },
    ratingAsked: false, adds: 0, sizes: {}, tipsRead: {}, challenges: {}, icon: 0,
  };
  let S = load();

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw) return Object.assign({}, DEFAULT, raw, { setup: Object.assign({}, DEFAULT.setup, raw.setup) });
    } catch (e) { /* storage blocked or corrupt */ }
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  function dayKey(t) {
    const d = new Date((t || Date.now()) - S.resetHour * 3600e3);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function yesterdayKey() { return dayKey(Date.now() - 864e5); }

  function rollover() {
    const today = dayKey();
    if (S.day === today) return false;
    if (S.day) S.history[S.day] = total();
    S.entries = [];
    S.day = today;
    S.tipsRead = {};
    save();
    return true;
  }
  function streakNow() {
    return (S.lastGoalDay === dayKey() || S.lastGoalDay === yesterdayKey()) ? S.streak : 0;
  }

  const drinkById = (id) => DRINKS.find((d) => d.id === id) || DRINKS[0];
  const hyd = (e) => e.ml * drinkById(e.drink).hydration;
  function total() { return Math.max(0, S.entries.reduce((s, e) => s + hyd(e), 0)); }
  function kcal() { return Math.round(S.entries.reduce((s, e) => s + e.ml / 100 * drinkById(e.drink).kcal, 0)); }
  function fmt(ml) { return S.units === 'oz' ? (ml / 29.5735).toFixed(1).replace('.0', '') + 'oz' : Math.round(ml) + 'ml'; }
  function char() { return CHARACTERS[S.char] || CHARACTERS[0]; }
  function capyFor(c, extra) { return A.capybara(Object.assign({ fur: c.fur, dark: c.dark, light: c.light, accessory: c.accessory }, extra)); }
  function textOn(hex) {
    const n = parseInt(hex.slice(1), 16);
    const l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return l > 0.68 ? '#1D2433' : '#fff';
  }

  /* ================= Particles (canvas) ================= */
  const fx = $('#fx');
  const ctx = fx.getContext('2d');
  let parts = [];
  function sizeFx() {
    const r = $('#app').getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    fx.width = r.width * dpr; fx.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function appPoint(rect) {
    const a = $('#app').getBoundingClientRect();
    return { x: rect.left - a.left + rect.width / 2, y: rect.top - a.top + rect.height / 2 };
  }
  function burst(x, y, opts) {
    opts = Object.assign({ n: 24, colors: ['#14B4E0'], speed: 6, kind: 'drop', gravity: 0.25, spread: Math.PI * 2, dir: -Math.PI / 2 }, opts);
    for (let i = 0; i < opts.n; i++) {
      const a = opts.dir + (Math.random() - 0.5) * opts.spread;
      const v = opts.speed * (0.5 + Math.random() * 0.8);
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: opts.gravity,
        c: opts.colors[i % opts.colors.length], r: opts.kind === 'drop' ? 3 + Math.random() * 4 : 5 + Math.random() * 5,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, life: 1, decay: 0.008 + Math.random() * 0.01, kind: opts.kind,
      });
    }
  }
  function confetti() {
    const r = $('#app').getBoundingClientRect();
    const cols = ['#14B4E0', '#FFA00A', '#6BBE1F', '#F0607A', '#FFD23F', '#5468FF'];
    burst(r.width * 0.2, r.height * 0.35, { n: 60, colors: cols, kind: 'conf', speed: 13, dir: -Math.PI / 3, spread: 1.4, gravity: 0.28 });
    burst(r.width * 0.8, r.height * 0.35, { n: 60, colors: cols, kind: 'conf', speed: 13, dir: -Math.PI * 2 / 3, spread: 1.4, gravity: 0.28 });
  }
  function drawParts() {
    if (!parts.length) { if (fx._dirty) { ctx.clearRect(0, 0, fx.width, fx.height); fx._dirty = false; } return; }
    fx._dirty = true;
    ctx.clearRect(0, 0, fx.width, fx.height);
    parts = parts.filter((p) => p.life > 0 && p.y < 2000);
    for (const p of parts) {
      p.vy += p.g; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
      ctx.globalAlpha = clamp(p.life * 1.5, 0, 1);
      ctx.fillStyle = p.c;
      ctx.save(); ctx.translate(p.x, p.y);
      if (p.kind === 'drop') {
        ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2);
        ctx.beginPath(); ctx.moveTo(0, -p.r * 1.8);
        ctx.quadraticCurveTo(p.r, 0, 0, p.r); ctx.quadraticCurveTo(-p.r, 0, 0, -p.r * 1.8); ctx.fill();
      } else {
        ctx.rotate(p.rot); ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2 + Math.abs(Math.sin(p.rot * 2)) * p.r / 2);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  /* ================= Hero (capybara that fills up) ================= */
  const TOP = 54, BOT = 454, FILL_H = BOT - TOP;
  const hero = $('#hero');
  const heroSvg = $('#heroSvg');
  let layers = []; // {color, cur, target, el}
  let agitation = 0;
  let previewMode = false;

  function renderHero() {
    const c = char();
    heroSvg.innerHTML = `
      <defs><clipPath id="heroClip">${A.capyClipShapes()}<path d="${A.BOARD}"/></clipPath></defs>
      <g class="breathe">
        <path d="${A.BOARD}" fill="#E9ECEF"/>
        ${A.capybara({ silhouette: true })}
        <g clip-path="url(#heroClip)" id="layerG"></g>
        <g class="capy-color">${A.board('#3DC6EE', '#FFD23F')}${capyFor(c)}</g>
      </g>`;
    layers.forEach((l) => { l.el = null; });
    buildLayers(false);
  }

  // Build the stack of coloured bands from today's entries (bottom → top).
  function computeStack() {
    const stack = [];
    for (const e of S.entries) {
      const d = drinkById(e.drink);
      const h = e.ml * d.hydration;
      if (h >= 0) {
        const last = stack[stack.length - 1];
        if (last && last.color === d.color) last.ml += h; else stack.push({ color: d.color, ml: h });
      } else {
        // alcohol: drains hydration from the top and leaves a thin band of its colour
        const band = Math.min(e.ml * 0.25, stack.reduce((s, l) => s + l.ml, 0));
        let remove = Math.abs(h) + band;
        while (remove > 0 && stack.length) {
          const top = stack[stack.length - 1];
          const take = Math.min(top.ml, remove);
          top.ml -= take; remove -= take;
          if (top.ml <= 0.5) stack.pop();
        }
        if (band > 0) stack.push({ color: d.color, ml: band });
      }
    }
    return stack;
  }

  function buildLayers(animate) {
    const stack = computeStack();
    const g = $('#layerG');
    const next = stack.map((s, i) => {
      const prev = layers[i];
      const target = Math.min(s.ml / S.goal, 1.05) * FILL_H;
      return { color: s.color, target, cur: animate && prev && prev.color === s.color ? prev.cur : (animate ? 0 : target), el: null };
    });
    if (animate) {
      // keep the previous heights for layers that already existed so only new liquid "pours in"
      next.forEach((l, i) => { if (layers[i] && layers[i].color === l.color) l.cur = layers[i].cur; });
    }
    layers = next;
    g.innerHTML = '';
    // draw from top-most to bottom so lower layers paint over the tails of upper ones
    for (let i = layers.length - 1; i >= 0; i--) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('fill', layers[i].color);
      g.appendChild(p);
      layers[i].el = p;
    }
    // bubbles drifting up inside the liquid
    const bub = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    bub.setAttribute('id', 'heroBubbles');
    bub.setAttribute('fill', '#fff');
    g.appendChild(bub);
  }

  const bubbles = [];
  function stepHero(t) {
    agitation *= 0.97;
    let acc = 0;
    const n = layers.length;
    for (let i = 0; i < n; i++) {
      const l = layers[i];
      l.cur += (l.target - l.cur) * (REDUCED ? 1 : 0.06);
      acc += l.cur;
      const y = BOT - acc;
      const isTop = i === n - 1;
      const amp = (isTop ? 4 : 1.6) + agitation * (isTop ? 1 : 0.35);
      const d = A.wavePath(t / (isTop ? 520 : 900) + i, 0, 335, amp, isTop ? Math.sin(t / 700) * agitation * 1.4 : 0, 520 - y);
      l.el.setAttribute('d', d);
      l.el.setAttribute('transform', `translate(0 ${y.toFixed(2)})`);
    }
    // bubbles
    const level = BOT - acc;
    const bg = $('#heroBubbles');
    if (bg && acc > 30) {
      if (Math.random() < 0.04 + agitation * 0.02) bubbles.push({ x: 60 + Math.random() * 220, y: BOT - 6, r: 1.5 + Math.random() * 3, s: 0.4 + Math.random() * 0.8, w: Math.random() * 6 });
      for (const b of bubbles) { b.y -= b.s; b.w += 0.05; }
      for (let i = bubbles.length - 1; i >= 0; i--) if (bubbles[i].y < level + 6) bubbles.splice(i, 1);
      bg.innerHTML = bubbles.map((b) => `<circle cx="${(b.x + Math.sin(b.w) * 3).toFixed(1)}" cy="${b.y.toFixed(1)}" r="${b.r}" opacity=".35"/>`).join('');
    } else if (bg) { bg.innerHTML = ''; bubbles.length = 0; }
  }

  /* sea lines under the board */
  const sea = $('#sea');
  sea.innerHTML = '<path id="sea1" fill="none" stroke="#9EE3F7" stroke-width="3" stroke-linecap="round"/><path id="sea2" fill="none" stroke="#C9F0FB" stroke-width="3" stroke-linecap="round"/>';
  function stepSea(t) {
    const line = (ph, y, amp) => {
      let d = '';
      for (let x = 0; x <= 400; x += 20) d += (x ? 'L' : 'M') + x + ' ' + (y + Math.sin(ph + x / 40) * amp).toFixed(1);
      return d;
    };
    $('#sea1').setAttribute('d', line(t / 600, 14, 4));
    $('#sea2').setAttribute('d', line(t / 800 + 2, 28, 3));
  }

  /* ================= Counter / streak ================= */
  let shownTotal = 0;
  function updateCounter(animate) {
    const tot = total();
    const pct = Math.round(tot / S.goal * 100);
    const counter = $('#counter');
    counter.classList.toggle('preview', previewMode);
    const sub = $('#counterSub');
    const kc = S.kcal ? ` · ${kcal()} kcal` : '';
    if (previewMode) {
      const rem = Math.max(0, S.goal - tot);
      tween(shownTotal, rem, animate);
      shownTotal = rem;
      sub.textContent = `Restantes · ${Math.max(0, 100 - pct)}% de tu meta`;
    } else {
      tween(shownTotal, tot, animate);
      shownTotal = tot;
      sub.textContent = `Hidratación · ${pct}% de tu meta${kc}`;
    }
    hero.classList.toggle('colored', previewMode || tot >= S.goal);
    // streak
    const st = streakNow();
    $('#streakNum').textContent = st;
    $('#streakLabel').textContent = st === 1 ? 'día' : 'días';
    $('#streakRing').style.strokeDashoffset = 94.25 * (1 - clamp(tot / S.goal, 0, 1));
  }
  let tweenRaf;
  function tween(from, to, animate) {
    const el = $('#counterValue');
    cancelAnimationFrame(tweenRaf);
    if (!animate || REDUCED) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 900;
    el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
    const step = (t) => {
      const k = clamp((t - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) tweenRaf = requestAnimationFrame(step);
    };
    tweenRaf = requestAnimationFrame(step);
  }

  $('#counter').addEventListener('click', () => {
    previewMode = !previewMode;
    shownTotal = previewMode ? total() : Math.max(0, S.goal - total());
    updateCounter(true);
    if (previewMode) { hero.classList.remove('happy'); void hero.offsetWidth; hero.classList.add('happy'); }
  });

  let streakTimer;
  $('#streakBtn').addEventListener('click', () => {
    const b = $('#streakBtn');
    b.classList.toggle('open');
    clearTimeout(streakTimer);
    streakTimer = setTimeout(() => b.classList.remove('open'), 2600);
  });

  /* ================= Drink row ================= */
  function renderDrinkRow() {
    const c = char();
    const row = $('#drinkRow');
    const visible = DRINKS.filter((d) => !S.hidden.includes(d.id));
    row.innerHTML =
      `<button class="drink avatar" data-act="char"><div class="ico"><svg viewBox="40 30 260 260">${capyFor(c)}</svg></div><div class="name">${c.name}</div></button>` +
      visible.map((d, i) => `<button class="drink" data-drink="${d.id}" style="animation-delay:${(i + 1) * 40}ms">
          <div class="ico">${A.vessel(d.vessel, d.color, 0.8, { decor: d.decor })}
          <span class="plus" style="background:${d.color}">${A.ICON.plus}</span></div>
          <div class="name">${d.name}</div></button>`).join('') +
      `<button class="drink edit" data-act="editDrinks" style="animation-delay:${(visible.length + 1) * 40}ms"><div class="ico"><span>${A.ICON.plus}</span></div><div class="name">Agregar o editar</div></button>`;
  }
  $('#drinkRow').addEventListener('click', (ev) => {
    const b = ev.target.closest('.drink');
    if (!b) return;
    if (b.dataset.drink) openAdd(drinkById(b.dataset.drink), b.querySelector('.vessel'));
    else if (b.dataset.act === 'char') openCharacters();
    else if (b.dataset.act === 'editDrinks') openDrinkEditor();
  });

  /* ================= Add drink screen ================= */
  const add = { drink: null, sizeIdx: 0, amount: 0, size: 0, level: 0, slosh: 0, sloshV: 0 };
  const addEl = $('#addDrink');
  const stage = $('#addStage');
  const handle = $('#handle');
  $('#addClose').innerHTML = A.ICON.close;
  $('#addMore').innerHTML = A.ICON.dots;
  handle.innerHTML = A.ICON.updown;

  const levelFor = (amount, size) => clamp(amount / size, 0, 1) * 0.9;

  function renderAddVessel() {
    const d = add.drink;
    $('#addVessel').innerHTML = A.vessel(d.vessel, d.color, levelFor(add.amount, add.size), { decor: d.decor });
    const prev = d.sizes[add.sizeIdx - 1];
    const next = d.sizes[add.sizeIdx + 1];
    $('#addPrev').innerHTML = prev ? A.vessel(d.vessel, d.color, 0.7, {}) : '';
    $('#addPrev').style.visibility = prev ? 'visible' : 'hidden';
    $('#addNext').textContent = next ? fmt(next) : '';
    updateAddLevel(false);
  }

  function updateAddLevel(bump) {
    const svg = $('#addVessel svg');
    if (!svg) return;
    const top = +svg.dataset.top, bot = +svg.dataset.bottom;
    add.level = levelFor(add.amount, add.size);
    const y = bot - (bot - top) * add.level;
    $('.liquid', svg).setAttribute('transform', `translate(0 ${y.toFixed(1)})`);
    $$('.deco', svg).forEach((g) => g.setAttribute('transform', `translate(0 ${(-y).toFixed(1)})`));
    const label = $('#addAmount');
    label.textContent = fmt(add.amount);
    if (bump) { label.classList.remove('bump'); void label.offsetWidth; label.classList.add('bump'); }
    // position the drag handle on the liquid surface
    const sr = stage.getBoundingClientRect(), vr = svg.getBoundingClientRect();
    const scale = vr.height / 222;
    handle.style.top = (vr.top - sr.top + y * scale) + 'px';
  }

  function stepAdd(t) {
    if (addEl.hidden) return;
    const svg = $('#addVessel svg');
    if (!svg) return;
    add.sloshV *= 0.92;
    add.slosh += (add.sloshV - add.slosh) * 0.1;
    const amp = 4 + Math.min(Math.abs(add.slosh) * 0.8, 10);
    $('.wave', svg).setAttribute('d', A.wavePath(t / 380, 0, 200, amp, clamp(add.slosh, -14, 14) * 2.2));
  }

  function openAdd(drink, fromEl) {
    add.drink = drink;
    const mem = S.sizes[drink.id];
    add.sizeIdx = mem ? clamp(mem.i, 0, drink.sizes.length - 1) : Math.min(1, drink.sizes.length - 1);
    add.size = drink.sizes[add.sizeIdx];
    add.amount = mem && mem.i === add.sizeIdx ? clamp(mem.a, 10, add.size) : add.size;
    const btn = $('#addBtn');
    btn.textContent = '+ ' + drink.name.toUpperCase();
    btn.style.background = drink.color;
    btn.style.color = textOn(drink.color);
    $('#addMore').style.background = A.shade(drink.color, 80);
    $('#addMore').style.color = drink.color;
    addEl.hidden = false;
    renderAddVessel();
    handle.classList.remove('hint');
    if (!S.adds) { void handle.offsetWidth; handle.classList.add('hint'); }

    // FLIP: grow vessel out of the tapped icon
    const target = $('#addVessel');
    addEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
    if (fromEl && !REDUCED) {
      const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
      const sx = a.width / b.width, sy = a.height / b.height;
      target.animate([
        { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${sx}, ${sy})`, transformOrigin: '0 0' },
        { transform: 'none', transformOrigin: '0 0' },
      ], { duration: 520, easing: 'cubic-bezier(.34,1.3,.64,1)' }).finished.then(() => updateAddLevel(false)).catch(() => {});
      $$('.add-amount, .add-actions', addEl).forEach((el, i) =>
        el.animate([{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, delay: 120 + i * 60, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
    }
    requestAnimationFrame(() => updateAddLevel(false));
  }

  function closeAdd() {
    const anim = addEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
    anim.onfinish = () => { addEl.hidden = true; };
  }
  $('#addClose').addEventListener('click', closeAdd);

  function setSize(i) {
    const d = add.drink;
    if (i < 0 || i >= d.sizes.length) return;
    add.sizeIdx = i; add.size = d.sizes[i]; add.amount = add.size;
    renderAddVessel();
    $('#addVessel').animate([{ transform: 'scale(.8)' }, { transform: 'scale(1.04)' }, { transform: 'none' }], { duration: 450, easing: 'ease-out' });
    add.sloshV = 10;
  }
  $('#addNext').addEventListener('click', () => setSize(add.sizeIdx + 1));
  $('#addPrev').addEventListener('click', () => setSize(add.sizeIdx - 1));
  $('#addMore').addEventListener('click', () => openDrinkInfo(add.drink));

  // Vertical drag adjusts the amount
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    const svg = $('#addVessel svg');
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const bodyPx = r.height * (+svg.dataset.bottom - +svg.dataset.top) / 222;
    drag = { y: e.clientY, amount: add.amount, bodyPx, lastY: e.clientY };
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('dragging');
    handle.classList.remove('hint');
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dy = e.clientY - drag.y;
    const perPx = add.size / 0.9 / drag.bodyPx;
    const amt = clamp(Math.round((drag.amount - dy * perPx) / 10) * 10, 10, add.size);
    add.sloshV += (e.clientY - drag.lastY) * 0.35;
    drag.lastY = e.clientY;
    if (amt !== add.amount) {
      add.amount = amt;
      updateAddLevel(true);
      if (navigator.vibrate) try { navigator.vibrate(4); } catch (err) { /* noop */ }
    }
  });
  const endDrag = () => { if (!drag) return; drag = null; stage.classList.remove('dragging'); };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  $('#addBtn').addEventListener('click', commitAdd);

  async function commitAdd() {
    const d = add.drink;
    const before = total();
    const entry = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), drink: d.id, ml: add.amount, ts: Date.now() };
    S.entries.push(entry);
    S.sizes[d.id] = { i: add.sizeIdx, a: add.amount };
    S.adds++;
    save();

    // Fly the vessel into the capybara
    const src = $('#addVessel svg');
    const flyer = $('#flyer');
    const a = $('#app').getBoundingClientRect();
    const r = src.getBoundingClientRect();
    flyer.innerHTML = src.outerHTML;
    Object.assign(flyer.style, { width: r.width + 'px', height: r.height + 'px', display: 'block' });
    addEl.hidden = true;
    previewMode = false;
    const hr = heroSvg.getBoundingClientRect();
    const tx = hr.left - a.left + hr.width / 2 - r.width * 0.18;
    const ty = hr.top - a.top + hr.height * 0.62 - r.height * 0.18;
    const x0 = r.left - a.left, y0 = r.top - a.top;
    if (!REDUCED) {
      $('#home').animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 400 });
      await flyer.animate([
        { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
        { transform: `translate(${(x0 + tx) / 2}px, ${Math.min(y0, ty) - 40}px) scale(.6) rotate(-8deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${tx}px, ${ty}px) scale(.36) rotate(-20deg)`, opacity: 0 },
      ], { duration: 620, easing: 'cubic-bezier(.5,0,.6,1)' }).finished.catch(() => {});
    }
    flyer.style.display = 'none';
    flyer.innerHTML = '';

    // Splash & pour
    const level = BOT - layers.reduce((s, l) => s + l.target, 0);
    const sp = hr.top - a.top + (level - 30) / 430 * hr.height;
    burst(hr.left - a.left + hr.width / 2, sp, { n: 22, colors: [d.color, A.shade(d.color, 30)], speed: 7, spread: 1.6 });
    agitation = 9;
    buildLayers(true);
    updateCounter(true);
    hero.classList.remove('happy'); void hero.offsetWidth; hero.classList.add('happy');

    const after = total();
    toast(`${d.hydration < 0 ? '−' : '+'}${fmt(Math.abs(Math.round(entry.ml * d.hydration)))} ${d.name}`, 'Deshacer', () => removeEntry(entry.id));
    if (before < S.goal && after >= S.goal) await goalReached();
    else if (S.adds === 2 && !S.ratingAsked) { await sleep(1200); askRating(); }
    checkChallengeProgress();
  }

  function removeEntry(id) {
    S.entries = S.entries.filter((e) => e.id !== id);
    save();
    buildLayers(true);
    layers.forEach((l) => { l.cur = Math.min(l.cur, l.target + 40); });
    agitation = 6;
    updateCounter(true);
  }

  async function goalReached() {
    const today = dayKey();
    if (S.lastGoalDay !== today) {
      S.streak = S.lastGoalDay === yesterdayKey() ? S.streak + 1 : 1;
      S.lastGoalDay = today;
    }
    let newChar = null;
    const locked = CHARACTERS.filter((c) => !S.unlocked.includes(c.id));
    if (locked.length) { newChar = locked[0]; S.unlocked.push(newChar.id); }
    save();
    updateCounter(false);
    const sb = $('#streakBtn');
    sb.classList.remove('bump'); void sb.offsetWidth; sb.classList.add('bump', 'open');
    setTimeout(() => sb.classList.remove('open'), 3000);
    await sleep(500);
    confetti();
    await sleep(700);
    showModal(`<div class="modal-card celebrate">
        <svg viewBox="0 30 335 430" class="big">${A.board('#3DC6EE', '#FFD23F')}${capyFor(char())}</svg>
        <h4>¡Meta cumplida!</h4>
        <p>Llegaste a ${fmt(S.goal)} hoy. Racha: ${S.streak} ${S.streak === 1 ? 'día' : 'días'} 🔥${newChar ? `<br>Desbloqueaste a <b>${newChar.name}</b> para tu colección.` : ''}</p>
        <button class="btn" data-close>¡GENIAL!</button></div>`);
  }

  /* ================= Toast / modal / sheet / panel ================= */
  let toastTimer;
  function toast(text, action, fn) {
    const t = $('#toast');
    t.hidden = false;
    t.innerHTML = `<span>${text}</span>${action ? `<button>${action}</button>` : ''}`;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    if (action) $('button', t).onclick = () => { t.hidden = true; fn(); };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
  }

  function showModal(html) {
    const m = $('#modal');
    m.innerHTML = html;
    m.hidden = false;
    return new Promise((res) => {
      m.onclick = (e) => {
        if (e.target === m || e.target.closest('[data-close]')) { m.hidden = true; res(); }
      };
    });
  }

  function askRating() {
    S.ratingAsked = true; save();
    showModal(`<div class="modal-card">
      <div class="app-ico">${iconSvg(S.icon)}</div>
      <h4>¿Te gusta Browine?</h4><p>Valora la app con estrellas. ¡Tu opinión hace feliz al carpincho!</p>
      <div class="stars">${[1, 2, 3, 4, 5].map((i) => `<button data-s="${i}" aria-label="${i} estrellas">${A.ICON.star}</button>`).join('')}</div>
      <button class="ghost" data-close>Ahora no</button></div>`);
    $$('#modal .stars button').forEach((b) => b.addEventListener('click', async () => {
      const n = +b.dataset.s;
      $$('#modal .stars button').forEach((x, i) => setTimeout(() => x.classList.toggle('on', i < n), i * 70));
      await sleep(700);
      $('#modal').hidden = true;
      toast(n >= 4 ? '¡Gracias! 🧡' : 'Gracias, ¡seguiremos mejorando!');
      if (n >= 4) confetti();
    }));
  }

  const sheet = $('#sheet'), backdrop = $('#sheetBackdrop');
  function openSheet(html, mount) {
    sheet.innerHTML = html;
    sheet.hidden = false; backdrop.hidden = false;
    sheet.classList.remove('out');
    sheet.scrollTop = 0;
    if (mount) mount(sheet);
  }
  function closeSheet() {
    if (sheet.hidden) return;
    sheet.classList.add('out');
    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
    setTimeout(() => { sheet.hidden = true; backdrop.hidden = true; }, 290);
  }
  backdrop.addEventListener('click', closeSheet);

  const panel = $('#panel');
  let panelDir = 'right';
  let panelStack = [];
  function openPanel(render, dir) {
    panelStack.push({ render, dir });
    panelDir = dir || 'right';
    panel.hidden = false;
    panel.className = 'panel from-' + panelDir;
    panel.scrollTop = 0;
    render(panel);
  }
  function closePanel() {
    panelStack.pop();
    const prev = panelStack[panelStack.length - 1];
    if (prev) { panel.className = 'panel'; panel.scrollTop = 0; prev.render(panel); return; }
    panel.className = 'panel out-' + panelDir;
    setTimeout(() => { panel.hidden = true; panel.innerHTML = ''; }, 330);
  }
  function closeAllPanels() { panelStack = [panelStack[0]]; closePanel(); }

  /* ================= Menu ================= */
  $('#menuBtn').innerHTML = A.ICON.menu;
  $('#menuBtn').addEventListener('click', () => openPanel(renderMenu, 'right'));

  function rowHtml(act, icon, title, value, sw) {
    return `<button class="row" data-act="${act}"><span class="ri">${icon}</span><span class="rt">${title}</span>
      ${value ? `<span class="rv">${value}</span>` : ''}${sw !== undefined ? `<span class="switch ${sw ? 'on' : ''}"></span>` : `<span class="chev">${A.ICON.chev}</span>`}</button>`;
  }
  const miniIcon = (color, inner) => `<svg viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="7" fill="${color}"/>${inner || ''}</svg>`;

  function renderMenu(p) {
    const today = new Date().toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const bubbles = Array.from({ length: 8 }, (_, i) =>
      `<span style="left:${10 + i * 11}%;width:${8 + (i % 3) * 6}px;height:${8 + (i % 3) * 6}px;animation-duration:${3 + (i % 4)}s;animation-delay:${i * 0.4}s"></span>`).join('');
    const rem = S.reminders.on && 'Notification' in window && Notification.permission === 'granted';
    p.innerHTML = `
      <div class="panel-head"><button class="icon-btn" data-act="back">${A.ICON.back}</button>
        <button class="pill-btn" data-act="news">NOVEDADES</button></div>
      <div class="member"><svg viewBox="0 0 40 40"><rect x="4" y="6" width="32" height="30" rx="8" fill="#DDF4FC"/><g transform="translate(6 6) scale(.09)">${capyFor(char())}</g>
        <circle cx="32" cy="32" r="7" fill="#14B4E0"/><path d="M29 32l2 2 4-4" stroke="#fff" stroke-width="2" fill="none"/></svg>
        <div><div class="d">${today}</div><div>Browine · versión completa</div><div class="a">Acceso: todos los personajes y funciones</div></div></div>

      <div class="card-reminders">
        <h3>Recordatorios</h3>
        ${rem ? `<p>Te avisaremos cada ${S.reminders.every / 60} h entre las 9:00 y las 21:00 si no has bebido.</p>
          <div class="rem-on">${A.ICON.bell} Activados <button class="pill-btn" data-act="remOff" style="margin-left:auto">DESACTIVAR</button></div>`
        : `<p>Debes permitir las notificaciones para que el carpincho te recuerde beber agua.</p>
          <button class="btn" data-act="reminders">ABRIR CONFIGURACIÓN</button>`}
        ${A.alarmClock()}
      </div>

      <button class="card-goal" data-act="goal"><div class="bubbles">${bubbles}</div>
        <div class="v">${fmt(S.goal)}</div><div class="l">Objetivo recomendado</div>
        <div class="s">Cambiar el peso, la actividad diaria o el clima</div><span class="chev">${A.ICON.chev}</span></button>

      ${rowHtml('history', miniIcon('#14B4E0', '<path d="M7 7h10l-1.5 11h-7z" fill="#fff"/>'), 'Historial de hoy', S.entries.length + ' bebidas')}
      ${rowHtml('editDrinks', miniIcon('#6BBE1F', '<path d="M12 6c3 3 4 5 4 7a4 4 0 0 1-8 0c0-2 1-4 4-7z" fill="#fff"/>'), 'Agregar/Editar bebidas')}
      ${rowHtml('widgets', miniIcon('#8EDBF3', '<rect x="5" y="5" width="6" height="6" rx="2" fill="#fff"/><rect x="13" y="5" width="6" height="6" rx="2" fill="#fff"/><rect x="5" y="13" width="14" height="6" rx="2" fill="#fff"/>'), 'Widgets')}
      ${rowHtml('icon', `<svg viewBox="0 0 24 24">${iconInner(S.icon, 24)}</svg>`, 'Icono de la aplicación')}
      <div class="gap"></div>
      ${rowHtml('reset', miniIcon('#F0607A', '<circle cx="12" cy="12" r="6" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 9v3l2 1" stroke="#fff" stroke-width="2" fill="none"/>'), 'Hora de reinicio del día', String(S.resetHour).padStart(2, '0') + ':00')}
      ${rowHtml('kcal', miniIcon('#FFA00A', '<path d="M12 5c1 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z" fill="#fff"/>'), 'Calorías', '', S.kcal)}
      ${rowHtml('units', miniIcon('#FFD23F', '<path d="M7 17V7l5 6 5-6v10" stroke="#fff" stroke-width="2" fill="none"/>'), 'Unidades de medida', S.units)}
      <button class="btn share-btn" data-act="share">${A.ICON.hand} Hidrata a tus amigos</button>
      ${rowHtml('wipe', miniIcon('#C7CDD3', '<path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2"/>'), 'Borrar datos de hoy')}
      <div class="small-print">Browine 1.0 · Todos los gráficos se generan con código</div>`;
    p.onclick = (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      ({
        back: closePanel,
        news: () => toast('Novedades: ¡33 carpinchos para coleccionar! 🎉'),
        reminders: () => enableReminders().then(() => renderMenu(p)),
        remOff: () => { S.reminders.on = false; save(); renderMenu(p); },
        goal: openGoalSheet,
        history: openHistory,
        editDrinks: openDrinkEditor,
        widgets: () => openPanel(renderWidgetIntro, 'bottom'),
        icon: openIconSheet,
        reset: openResetSheet,
        kcal: () => { S.kcal = !S.kcal; save(); b.querySelector('.switch').classList.toggle('on', S.kcal); updateCounter(false); },
        units: () => { S.units = S.units === 'ml' ? 'oz' : 'ml'; save(); renderMenu(p); updateCounter(false); },
        share: shareApp,
        wipe: () => { if (confirm('¿Borrar todas las bebidas de hoy?')) { S.entries = []; save(); buildLayers(true); updateCounter(true); renderMenu(p); } },
      })[act]();
    };
  }

  async function enableReminders() {
    if (!('Notification' in window)) { toast('Tu navegador no admite notificaciones'); return; }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      S.reminders.on = true; S.setup.reminders = true; save();
      toast('¡Recordatorios activados! ⏰');
      renderSetup();
    } else toast('Permiso de notificaciones denegado');
  }
  function reminderTick() {
    if (!S.reminders.on || !('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date(), h = now.getHours();
    if (h < 9 || h >= 21 || total() >= S.goal) return;
    const last = Math.max(S.entries.length ? S.entries[S.entries.length - 1].ts : 0, S.reminders.last);
    if (Date.now() - last > S.reminders.every * 60e3) {
      S.reminders.last = Date.now(); save();
      try { new Notification('Browine', { body: '¡Hora de un vaso de agua! El carpincho tiene sed 💧', icon: 'icon.svg' }); } catch (e) { /* noop */ }
    }
  }

  async function shareApp() {
    const data = { title: 'Browine', text: 'Me hidrato con un carpincho 🧡💧 ¡Prueba Browine!', url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch (e) { /* cancelled */ } }
    else { try { await navigator.clipboard.writeText(data.text + ' ' + data.url); toast('Enlace copiado'); } catch (e) { toast(data.url); } }
  }

  /* ---------- Goal sheet ---------- */
  const ACT = ['Sedentario', 'Activo', 'Muy activo'], ACTF = [1, 1.12, 1.25];
  const WEA = ['Frío', 'Templado', 'Caluroso'], WEAF = [0.95, 1, 1.12];
  function recommended(p) { return Math.round(p.weight * 33 * ACTF[p.activity] * WEAF[p.weather] / 10) * 10; }
  function openGoalSheet() {
    const p = Object.assign({}, S.profile);
    let goal = S.goal;
    openSheet(`<h3>Tu objetivo diario</h3><p class="sub">Calculado según tu peso, actividad y clima</p>
      <div class="goal-big" id="gBig">${fmt(goal)}</div>
      <div class="stepper"><button data-d="-50">−</button><span class="rv">ajuste manual</span><button data-d="50">+</button></div>
      <div class="field"><label>Peso <b id="wv">${p.weight} kg</b></label><input type="range" min="35" max="160" value="${p.weight}" id="wRange"></div>
      <div class="field"><label>Actividad diaria</label><div class="chips" id="actC">${ACT.map((a, i) => `<button class="chip ${i === p.activity ? 'on' : ''}" data-i="${i}">${a}</button>`).join('')}</div></div>
      <div class="field"><label>Clima</label><div class="chips" id="weaC">${WEA.map((a, i) => `<button class="chip ${i === p.weather ? 'on' : ''}" data-i="${i}">${a}</button>`).join('')}</div></div>
      <button class="btn" id="gSave">GUARDAR</button>`, (s) => {
      const big = $('#gBig', s);
      const set = (g) => { goal = clamp(g, 500, 6000); big.textContent = fmt(goal); big.animate([{ transform: 'scale(1.08)' }, { transform: 'none' }], { duration: 250 }); };
      $('#wRange', s).oninput = (e) => { p.weight = +e.target.value; $('#wv', s).textContent = p.weight + ' kg'; set(recommended(p)); };
      const chips = (id, key) => $(id, s).onclick = (e) => {
        const c = e.target.closest('.chip'); if (!c) return;
        p[key] = +c.dataset.i; $$('.chip', $(id, s)).forEach((x) => x.classList.toggle('on', x === c)); set(recommended(p));
      };
      chips('#actC', 'activity'); chips('#weaC', 'weather');
      $$('.stepper button', s).forEach((b) => b.onclick = () => set(goal + +b.dataset.d));
      $('#gSave', s).onclick = () => {
        S.goal = goal; S.profile = p; S.setup.goal = true; save();
        closeSheet(); buildLayers(true); updateCounter(true); renderSetup();
        if (panelStack.length && !panel.hidden) renderMenu(panel);
        if (total() >= S.goal && S.lastGoalDay !== dayKey()) goalReached();
      };
    });
  }

  /* ---------- History ---------- */
  function openHistory() {
    const render = (s) => {
      const items = S.entries.slice().reverse();
      s.innerHTML = `<h3>Hoy</h3><p class="sub">${fmt(total())} de ${fmt(S.goal)}</p>` + (items.length ? items.map((e, i) => {
        const d = drinkById(e.drink);
        const time = new Date(e.ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
        return `<div class="hist-item" style="animation-delay:${i * 40}ms">${A.vessel(d.vessel, d.color, 0.8, {})}<div class="hn">${d.name}<div class="ht">${fmt(e.ml)} · ${time}</div></div><button data-id="${e.id}">QUITAR</button></div>`;
      }).join('') : '<p class="sub">Todavía no registraste bebidas hoy.</p>');
      $$('button[data-id]', s).forEach((b) => b.onclick = () => { removeEntry(b.dataset.id); render(s); if (!panel.hidden) renderMenu(panel); });
    };
    openSheet('', render);
  }

  /* ---------- Drink editor ---------- */
  function openDrinkEditor() {
    openSheet(`<h3>Agregar o editar bebidas</h3><p class="sub">Elige qué bebidas aparecen en tu pantalla</p>` +
      DRINKS.map((d) => `<div class="drink-toggle">${A.vessel(d.vessel, d.color, 0.8, { decor: d.decor })}<span>${d.name}<br><small style="color:var(--muted)">Hidratación ${Math.round(d.hydration * 100)}%</small></span>
        <button class="switch ${S.hidden.includes(d.id) ? '' : 'on'}" data-id="${d.id}" aria-label="${d.name}"></button></div>`).join(''), (s) => {
      $$('.switch', s).forEach((b) => b.onclick = () => {
        const id = b.dataset.id;
        if (S.hidden.includes(id)) S.hidden = S.hidden.filter((x) => x !== id);
        else if (DRINKS.length - S.hidden.length > 1) S.hidden.push(id);
        b.classList.toggle('on', !S.hidden.includes(id));
        save(); renderDrinkRow();
      });
    });
  }

  /* ---------- Drink info ---------- */
  function openDrinkInfo(d) {
    openSheet(`<h3>${d.name}</h3><p class="sub">Así cuenta para tu hidratación</p>
      <div class="info-grid"><div><b style="color:${d.hydration < 0 ? 'var(--red)' : d.color}">${Math.round(d.hydration * 100)}%</b>hidratación</div>
      <div><b>${fmt(Math.round(add.amount * d.hydration))}</b>suma a tu meta</div>
      <div><b>${Math.round(add.amount / 100 * d.kcal)}</b>kcal</div><div><b>${fmt(add.amount)}</b>cantidad</div></div>
      ${d.hydration < 0 ? '<p class="sub">Las bebidas alcohólicas deshidratan: restan agua de tu carpincho.</p>' : ''}
      <button class="btn" data-x style="background:${d.color};color:${textOn(d.color)}">ENTENDIDO</button>`, (s) => { $('[data-x]', s).onclick = closeSheet; });
  }

  /* ---------- App icon ---------- */
  const ICON_BG = ['#14B4E0', '#FFA00A', '#6BBE1F', '#F0607A', '#5468FF', '#1D2433', '#FFD23F', '#7FD3BE'];
  function iconInner(i, size) {
    const c = CHARACTERS[i % 8] || CHARACTERS[0];
    const k = size / 100;
    return `<rect width="${size}" height="${size}" rx="${22 * k}" fill="${ICON_BG[i % 8]}"/><g transform="scale(${k}) translate(-38 -14) scale(.5)">${capyFor(c)}</g>`;
  }
  function iconSvg(i) { return `<svg viewBox="0 0 100 100">${iconInner(i, 100)}</svg>`; }
  function applyIcon() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${iconInner(S.icon, 100)}</svg>`;
    $('#favicon').href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function openIconSheet() {
    openSheet(`<h3>Icono de la aplicación</h3><p class="sub">Elige tu carpincho favorito</p>
      <div class="icons-grid">${ICON_BG.map((_, i) => `<button class="${i === S.icon ? 'on' : ''}" data-i="${i}">${iconSvg(i)}</button>`).join('')}</div>`, (s) => {
      $$('.icons-grid button', s).forEach((b) => b.onclick = () => {
        S.icon = +b.dataset.i; save(); applyIcon();
        $$('.icons-grid button', s).forEach((x) => x.classList.toggle('on', x === b));
        b.animate([{ transform: 'scale(.8) rotate(-10deg)' }, { transform: 'scale(1.1)' }, { transform: 'none' }], { duration: 400 });
        if (!panel.hidden) renderMenu(panel);
      });
    });
  }

  function openResetSheet() {
    openSheet(`<h3>Hora de reinicio</h3><p class="sub">¿A qué hora empieza tu nuevo día de hidratación?</p>
      <div class="chips" style="justify-content:center">${[0, 1, 2, 3, 4, 5, 6].map((h) => `<button class="chip ${h === S.resetHour ? 'on' : ''}" data-h="${h}">${String(h).padStart(2, '0')}:00</button>`).join('')}</div>`, (s) => {
      $$('.chip', s).forEach((b) => b.onclick = () => {
        S.resetHour = +b.dataset.h; S.day = dayKey(); save();
        $$('.chip', s).forEach((x) => x.classList.toggle('on', x === b));
        if (!panel.hidden) renderMenu(panel);
        setTimeout(closeSheet, 250);
      });
    });
  }

  /* ================= Characters ================= */
  function openCharacters() { openPanel(renderCharacters, 'bottom'); }
  function renderCharacters(p) {
    const c = char();
    const n = S.unlocked.length;
    p.innerHTML = `
      <div class="panel-head"><button class="pill-btn blue" data-act="shuffle">${A.ICON.shuffle} MEZCLAR</button>
        <button class="icon-btn" data-act="close">${A.ICON.close}</button></div>
      <div class="char-top"><div class="big"><svg viewBox="40 30 260 260" id="bigChar">${capyFor(c)}</svg></div>
        <div><h2>${c.name}</h2><p>Completa tu meta de hidratación. ¡Consigue un nuevo personaje al día siguiente!</p>
        <div class="count">${n} de ${CHARACTERS.length} coleccionados</div></div></div>
      <button class="btn char-get" disabled>${A.ICON.drop} CONSEGUIR UN PERSONAJE</button>
      <div class="sec-title"><span class="pill">${n}/${CHARACTERS.length}</span><b>Diario</b></div>
      <div class="grid">${CHARACTERS.map((ch, i) => {
        const un = S.unlocked.includes(ch.id);
        return `<button class="cell ${ch.id === S.char ? 'sel' : ''} ${un ? 'pop' : ''}" data-id="${ch.id}" ${un ? '' : 'disabled'} style="animation-delay:${i * 25}ms">
          <svg viewBox="20 30 300 380">${un ? capyFor(ch) : A.capybara({ silhouette: true, silColor: '#D7EEF7' })}</svg></button>`;
      }).join('')}</div>`;
    p.onclick = (e) => {
      const b = e.target.closest('[data-act],[data-id]');
      if (!b) return;
      if (b.dataset.act === 'close') return closePanel();
      if (b.dataset.act === 'shuffle') {
        const pool = S.unlocked.filter((id) => id !== S.char);
        if (!pool.length) { toast('Cumple tu meta para conseguir más carpinchos'); $('#bigChar', p).animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(12deg)' }, { transform: 'none' }], { duration: 500 }); return; }
        return selectChar(pool[Math.floor(Math.random() * pool.length)], p);
      }
      if (b.dataset.id !== undefined) selectChar(+b.dataset.id, p);
    };
  }
  function selectChar(id, p) {
    S.char = id; save();
    renderCharacters(p);
    $('#bigChar', p).parentElement.animate([{ transform: 'scale(.5) rotate(-30deg)' }, { transform: 'scale(1.1)' }, { transform: 'none' }], { duration: 550, easing: 'ease-out' });
    renderHero(); renderDrinkRow(); renderSetup(); updateCounter(false);
  }

  /* ================= Widgets tutorial ================= */
  function renderWidgetIntro(p) {
    p.innerHTML = `<div class="panel-head"><span></span><button class="icon-btn" data-act="close">${A.ICON.close}</button></div>
      <div class="wg-hero">${A.widgetPhone()}</div>
      <h2 class="wg-title">Agrega un<br>widget genial</h2>
      <p class="wg-sub">Controla tus objetivos de hidratación desde la pantalla de inicio o de bloqueo</p>
      <div class="center"><button class="btn navy" data-act="want">${A.ICON.hand} ¡LO QUIERO!</button></div>`;
    p.onclick = (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'close') closePanel();
      if (b.dataset.act === 'want') { S.setup.widget = true; save(); renderSetup(); openPanel(renderWidgetSteps, 'right'); }
    };
  }
  const WSTEPS = [
    [['hand', 'Mantén pulsada cualquier parte de la pantalla de inicio'], ['plus', 'Toca el botón de la esquina superior izquierda. Luego, "Añadir widget".'], ['search', 'Busca Browine']],
    [['hand', 'Mantén pulsada la pantalla de bloqueo y toca "Personalizar"'], ['plus', 'Toca el área de widgets bajo la hora'], ['search', 'Elige Browine y tu tamaño favorito']],
    [['hand', 'Abre Ajustes → Centro de control'], ['plus', 'Toca "Añadir un control"'], ['search', 'Busca Browine para registrar agua con un toque']],
  ];
  function renderWidgetSteps(p) {
    let tab = 0;
    p.innerHTML = `<div class="panel-head"><button class="icon-btn" data-act="back">${A.ICON.back}</button><button class="icon-btn" data-act="close">${A.ICON.close}</button></div>
      <div class="wg-hero" id="wgHero">${A.widgetPhone()}</div>
      <div class="tabs" id="tabs"><span class="ind"></span>${['Pantalla de inicio', 'Pantalla de bloqueo', 'Centro de control'].map((t, i) => `<button data-t="${i}">${t}</button>`).join('')}</div>
      <div id="steps"></div>
      <p class="small-print">En el navegador: menú Compartir → "Añadir a pantalla de inicio" para instalar Browine como app.</p>`;
    const draw = () => {
      const btns = $$('#tabs button', p);
      btns.forEach((b, i) => b.classList.toggle('on', i === tab));
      const ind = $('#tabs .ind', p), on = btns[tab];
      ind.style.left = on.offsetLeft + 'px'; ind.style.width = on.offsetWidth + 'px';
      $('#steps', p).innerHTML = WSTEPS[tab].map(([ic, t], i) => `<div class="step" style="animation-delay:${i * 80}ms"><span class="n">${A.ICON[ic]}</span>${t}</div>`).join('');
      $('#wgHero', p).innerHTML = A.widgetPhone();
    };
    requestAnimationFrame(draw);
    p.onclick = (e) => {
      const t = e.target.closest('[data-t]'); if (t) { tab = +t.dataset.t; draw(); return; }
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'back') closePanel();
      if (b.dataset.act === 'close') closeAllPanels();
    };
  }

  /* ================= Home sections ================= */
  function renderSetup() {
    const done = ['reminders', 'widget', 'goal'].filter((k) => S.setup[k]).length;
    const card = $('#setupCard');
    const pill = $('#setupPill');
    const show = !S.setup.dismissed && done < 3;
    card.hidden = !show;
    pill.hidden = !show;
    if (!show) return;
    pill.innerHTML = `<span class="count">${done}/3</span><span class="txt">Finaliza tu<br>configuración</span>
      <svg viewBox="80 40 220 200" class="peek">${capyFor(char())}</svg>`;
    const task = (k, label, color) => `<button class="task ${S.setup[k] ? 'done' : ''}" data-k="${k}" style="background:${color}">${label}<span class="tick">${A.ICON.check}</span></button>`;
    card.innerHTML = `<svg viewBox="60 40 260 300" class="capy-peek">${capyFor(char())}</svg>
      <h3>¡Finaliza tu configuración para lograr el éxito en la hidratación de cada día!</h3>
      ${task('reminders', 'Habilitar los recordatorios inteligentes', '#E8344E')}
      ${task('widget', 'Agregar widget', '#2747B8')}
      ${task('goal', 'Establece tu objetivo diario', '#14B4E0')}
      <button class="skip-all" data-k="skip">IGNORAR TODO</button>`;
  }
  $('#setupCard').addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    const k = b.dataset.k;
    if (k === 'skip') {
      const card = $('#setupCard');
      card.classList.add('collapse');
      setTimeout(() => { S.setup.dismissed = true; save(); card.classList.remove('collapse'); renderSetup(); }, 500);
    } else if (k === 'reminders') enableReminders();
    else if (k === 'widget') openPanel(renderWidgetIntro, 'bottom');
    else if (k === 'goal') openGoalSheet();
  });
  $('#setupPill').addEventListener('click', () => {
    const sc = $('#homeScroll');
    sc.scrollTo({ top: $('#setupCard').offsetTop - 70, behavior: 'smooth' });
  });
  $('#homeScroll').addEventListener('scroll', (e) => {
    $('#setupPill').classList.toggle('hide', e.target.scrollTop > 60);
  }, { passive: true });

  function chalArt(color, acc, fur) {
    return `<svg viewBox="20 30 300 380" class="art">${A.capybara({ fur: fur || '#E39A5C', dark: A.shade(fur || '#E39A5C', -28), light: '#EEB173', accessory: acc })}</svg>`;
  }

  function renderLimited() {
    $('#limitedBlock').innerHTML = `<div class="limited"><div class="lbl">Desafío por tiempo limitado</div>
      <div class="chal-hero" style="background:${LIMITED.color}">
        <div class="kicker">Desafío de ${LIMITED.days} días</div><h2>${LIMITED.name}</h2>
        <p>${LIMITED.text}</p>${chalArt(LIMITED.color, LIMITED.acc)}
        <button class="btn" data-limited>COMENZAR AHORA</button>
        <div class="rules">VER LAS REGLAS DEL DESAFÍO</div></div></div>`;
    $('#limitedBlock [data-limited]').onclick = () => openChallenge(Object.assign({ id: 'limited', benefits: ['Electrolitos naturales', 'Menos azúcar que un jugo', 'Sabor tropical'] }, LIMITED));
  }

  function todaysTips() {
    const seed = parseInt(dayKey().replace(/-/g, ''), 10);
    return [0, 1, 2].map((i) => TIPS[(seed + i * 4) % TIPS.length]);
  }
  function renderTips() {
    const tips = todaysTips();
    const read = tips.filter((t) => S.tipsRead[t.title]).length;
    const drinks = ['coco', 'agua', 'te', 'jugo', 'smoothie'];
    $('#tipsBlock').innerHTML = `<div class="tips-head"><span class="pill">${A.ICON.check} ${read}/3</span><b>Consejos de hoy</b></div>
      <div class="tips">${tips.map((t, i) => {
        const d = drinkById(drinks[(TIPS.indexOf(t)) % drinks.length]);
        return `<button class="tip ${S.tipsRead[t.title] ? 'read' : ''}" data-t="${t.title}" style="background:${t.color}"><h5>${t.title}</h5><p>${t.text}</p>
          <div class="art">${A.vessel(d.vessel, d.color, 0.75, { decor: d.decor })}</div></button>`;
      }).join('')}</div>`;
    $$('#tipsBlock .tip').forEach((b) => b.onclick = () => {
      S.tipsRead[b.dataset.t] = true; save(); renderTips();
      const nb = $(`#tipsBlock .tip[data-t="${CSS.escape(b.dataset.t)}"]`);
      if (nb) nb.animate([{ transform: 'scale(.95)' }, { transform: 'none' }], { duration: 300 });
    });
  }

  function chalProgress(id) {
    const c = S.challenges[id];
    if (!c) return null;
    const days = Math.floor((new Date(dayKey()) - new Date(c.start)) / 864e5) + 1;
    return days;
  }
  function renderHabits() {
    const started = CHALLENGES.filter((c) => S.challenges[c.id]).length;
    $('#habitsBlock').innerHTML = `<div class="habits-title">Desarrollar hábitos saludables ${started}/${CHALLENGES.length}</div>` +
      CHALLENGES.map((c, i) => {
        const pr = chalProgress(c.id);
        return `<button class="chal-card" data-c="${c.id}" style="background:${c.color};animation-delay:${i * 70}ms">
          <span class="k">Desafío de ${c.days} días</span><span class="t">${c.name}</span>${chalArt(c.color, c.acc)}
          ${pr ? `<span class="prog">Día ${Math.min(pr, c.days)} de ${c.days}</span>` : ''}</button>`;
      }).join('');
    $$('#habitsBlock .chal-card').forEach((b) => b.onclick = () => openChallenge(CHALLENGES.find((c) => c.id === b.dataset.c)));
  }
  function checkChallengeProgress() { renderHabits(); }

  function openChallenge(c) {
    openPanel((p) => {
      const pr = chalProgress(c.id);
      p.innerHTML = `<div class="chal-detail" style="background:${c.color}">
          <div class="top-actions"><button class="icon-btn" data-act="share">${A.ICON.dots}</button><button class="icon-btn" data-act="close">${A.ICON.close}</button></div>
          <div class="k">Desafío de ${c.days} días</div><h2>${c.name}</h2>
          <p>${c.text.split('.')[0]}.</p>${chalArt(c.color, c.acc)}
          <button class="btn" data-act="share">${A.ICON.hand} CUÉNTALE A TUS AMIGOS</button>
          ${pr ? `<div class="prog-days">${Array.from({ length: c.days }, (_, i) => `<i class="${i < pr ? 'on' : ''}"></i>`).join('')}</div>` : ''}
        </div>
        <div class="chal-body"><p>${c.text}</p><h3>Beneficios</h3><ul>${(c.benefits || []).map((b) => `<li>${b}</li>`).join('')}</ul>
          <h3>Reglas</h3><p>Registra tus bebidas todos los días durante ${c.days} días. Si fallas un día, ¡el carpincho te dará otra oportunidad!</p></div>
        <div class="float-cta"><button class="btn" data-act="start">${pr ? `DÍA ${Math.min(pr, c.days)} DE ${c.days} · ABANDONAR` : `${iconSmall()} COMENZAR AHORA`}</button></div>`;
      p.onclick = (e) => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        if (b.dataset.act === 'close') closePanel();
        if (b.dataset.act === 'share') shareApp();
        if (b.dataset.act === 'start') {
          if (S.challenges[c.id]) delete S.challenges[c.id];
          else { S.challenges[c.id] = { start: dayKey() }; confetti(); toast('¡Desafío iniciado! 💪'); }
          save(); renderHabits(); closePanel();
        }
      };
    }, 'bottom');
  }
  function iconSmall() { return `<svg viewBox="0 0 100 100" style="width:22px;height:22px;border-radius:50%">${iconInner(S.icon, 100)}</svg>`; }

  /* ================= Splash ================= */
  async function splash() {
    const s = $('#splash');
    $('.splash-capy', s).innerHTML = `<g class="board-wrap">${A.board('#3DC6EE', '#FFD23F')}</g><g class="capy-wrap">${capyFor(char())}</g>`;
    $('.splash-word', s).innerHTML = 'Browine'.split('').map((l, i) => `<span style="animation-delay:${0.5 + i * 0.06}s">${l}</span>`).join('');
    await sleep(REDUCED ? 100 : 1500);
    if (!REDUCED) {
      const r = s.getBoundingClientRect();
      burst(r.width / 2, r.height * 0.5, { n: 30, colors: ['#14B4E0', '#6FD8F7'], speed: 8 });
    }
    s.classList.add('out');
    setTimeout(() => s.remove(), 500);
  }

  /* ================= Main loop ================= */
  function loop(t) {
    stepHero(t);
    stepSea(t);
    stepAdd(t);
    drawParts();
    requestAnimationFrame(loop);
  }

  function init() {
    rollover();
    applyIcon();
    renderHero();
    renderDrinkRow();
    renderSetup();
    renderLimited();
    renderTips();
    renderHabits();
    shownTotal = 0;
    updateCounter(true);
    sizeFx();
    window.addEventListener('resize', sizeFx);
    requestAnimationFrame(loop);
    splash();
    setInterval(() => {
      if (rollover()) { buildLayers(false); updateCounter(false); renderTips(); renderHabits(); }
      reminderTick();
    }, 60e3);
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!$('#modal').hidden) $('#modal').hidden = true;
      else if (!sheet.hidden) closeSheet();
      else if (!addEl.hidden) closeAdd();
      else if (!panel.hidden) closePanel();
    });
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }
  init();
})();
