/* Browine — all illustrations are generated in code (SVG strings). */
(function (global) {
  'use strict';

  const OUT = '#4a2716';

  /* ---------- Capybara ---------- */
  // Coordinates live in a 300 x 400 box. The capybara looks to the right.
  const CAPY = {
    body:
      'M84 382 C46 362 38 292 58 232 C72 186 80 134 110 104 ' +
      'C136 78 192 70 228 90 C262 108 274 142 264 170 ' +
      'C258 194 240 204 218 204 C238 236 256 290 250 340 ' +
      'C246 378 206 388 160 388 C130 388 104 390 84 382 Z',
    earBack: 'M102 112 C88 104 86 82 102 74 C116 68 130 80 128 96 Z',
    earTop: 'M146 84 C140 66 154 54 168 60 C178 66 176 80 170 86 Z',
    snout:
      'M226 94 C204 110 202 164 222 192 C244 200 264 186 266 162 ' +
      'C270 132 254 104 226 94 Z',
    footL: 'M86 392 C84 374 104 366 124 370 C146 374 150 392 138 398 C120 402 94 402 86 392 Z',
    footR: 'M188 394 C186 376 206 368 226 372 C248 376 252 394 240 400 C222 404 196 404 188 394 Z',
  };

  function capybara(o) {
    o = Object.assign({ fur: '#E39A5C', dark: '#AE6D4B', light: '#EEB173', accessory: null, silhouette: false }, o || {});
    if (o.silhouette) {
      const c = o.silColor || '#E9ECEF';
      return `<g fill="${c}">
        <path d="${CAPY.earBack}"/><path d="${CAPY.earTop}"/>
        <path d="${CAPY.body}"/><path d="${CAPY.footL}"/><path d="${CAPY.footR}"/></g>`;
    }
    const { fur, dark, light } = o;
    const sw = 'stroke="' + OUT + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
    const fine = 'stroke="' + OUT + '" stroke-width="4" fill="none" stroke-linecap="round"';
    const tuft = 'stroke="' + dark + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"';
    return `
    <g class="capy">
      <path d="${CAPY.earBack}" fill="${fur}" ${sw}/>
      <path d="M104 104 C96 98 96 86 104 82 C112 80 120 88 118 98 Z" fill="${dark}" opacity=".8"/>
      <path d="${CAPY.earTop}" fill="${fur}" ${sw}/>
      <path d="M152 80 C149 70 156 64 164 67 C169 70 168 77 165 80 Z" fill="${dark}" opacity=".8"/>
      <path d="${CAPY.body}" fill="${fur}" ${sw}/>
      <path d="M120 300 C110 250 140 230 168 236 C200 244 214 300 206 352 C196 380 136 384 120 300 Z" fill="${light}" opacity=".55"/>
      <path d="${CAPY.snout}" fill="${dark}" opacity=".85"/>
      <ellipse cx="246" cy="128" rx="5" ry="7" fill="${OUT}" transform="rotate(-15 246 128)"/>
      <path d="M244 152 C248 160 254 162 258 156 M244 152 C240 162 232 164 228 158" ${fine}/>
      <g class="capy-eye"><path d="M162 124 Q176 108 190 122" ${fine} stroke-width="5"/></g>
      <ellipse class="capy-blush" cx="196" cy="146" rx="11" ry="6" fill="#F07C6C" opacity=".35"/>
      <path d="M60 240 l-10 -6 M66 210 l-9 -8 M80 170 l-8 -6 M228 300 l8 -3 M70 330 l-9 2" ${tuft}/>
      <path d="M150 180 l6 6 M120 150 l4 7 M180 270 l5 6 M100 260 l4 7 M200 220 l4 6" ${tuft}/>
      <path d="M158 238 C176 250 182 272 172 292" ${fine}/>
      <g class="capy-paws">
        <path d="M170 262 C186 252 206 262 204 280 C202 294 188 298 178 290 C168 282 162 270 170 262 Z" fill="${dark}" ${sw}/>
        <path d="M184 288 l-2 -8 M194 288 l0 -9" ${fine} stroke-width="3"/>
        <path d="M214 252 C228 246 244 256 240 274 C236 288 222 290 214 282 C206 274 206 258 214 252 Z" fill="${dark}" ${sw}/>
        <path d="M222 280 l1 -8 M231 280 l2 -8" ${fine} stroke-width="3"/>
      </g>
      <path d="${CAPY.footL}" fill="${dark}" ${sw}/>
      <path d="${CAPY.footR}" fill="${dark}" ${sw}/>
      ${accessory(o.accessory)}
    </g>`;
  }

  function accessory(a) {
    switch (a) {
      case 'orange':
        return `<g class="acc"><path d="M150 70 C150 46 176 40 186 56 C196 72 182 88 164 86 C154 84 150 78 150 70 Z" fill="#FFA00A" stroke="${OUT}" stroke-width="4"/>
          <path d="M168 50 C172 38 186 36 190 42 C182 46 176 50 168 50 Z" fill="#6BBE1F" stroke="${OUT}" stroke-width="3"/></g>`;
      case 'glasses':
        return `<g class="acc"><rect x="158" y="106" width="40" height="28" rx="12" fill="#2D2D44" stroke="${OUT}" stroke-width="4"/>
          <rect x="206" y="104" width="34" height="28" rx="12" fill="#2D2D44" stroke="${OUT}" stroke-width="4"/>
          <path d="M198 118 L206 116 M158 116 L130 108" stroke="${OUT}" stroke-width="4"/>
          <path d="M166 112 l10 0" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/></g>`;
      case 'flower':
        return `<g class="acc" transform="translate(132 82)">${[0, 72, 144, 216, 288].map(r =>
          `<ellipse cx="0" cy="-12" rx="8" ry="12" fill="#FF7FA8" stroke="${OUT}" stroke-width="3" transform="rotate(${r})"/>`).join('')}
          <circle r="7" fill="#FFD23F" stroke="${OUT}" stroke-width="3"/></g>`;
      case 'beanie':
        return `<g class="acc"><path d="M100 104 C104 58 170 40 212 76 C218 82 216 92 208 92 C170 70 130 80 108 112 Z" fill="#5468FF" stroke="${OUT}" stroke-width="4"/>
          <circle cx="150" cy="54" r="12" fill="#fff" stroke="${OUT}" stroke-width="4"/></g>`;
      case 'crown':
        return `<g class="acc"><path d="M130 80 L136 46 L152 64 L166 40 L178 64 L196 48 L196 84 C176 76 150 76 130 80 Z" fill="#FFD23F" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
          <circle cx="166" cy="66" r="5" fill="#F0607A"/></g>`;
      case 'scarf':
        return `<g class="acc"><path d="M150 196 C176 214 214 214 232 198 L238 214 C214 236 170 234 146 212 Z" fill="#E63946" stroke="${OUT}" stroke-width="4"/>
          <path d="M214 214 L222 262 L240 258 L232 210 Z" fill="#E63946" stroke="${OUT}" stroke-width="4"/></g>`;
      case 'cap':
        return `<g class="acc"><path d="M112 98 C116 60 180 50 206 86 Z" fill="#14B4E0" stroke="${OUT}" stroke-width="4"/>
          <path d="M200 84 C224 80 248 88 252 96 C232 98 214 96 200 92 Z" fill="#0E8DB3" stroke="${OUT}" stroke-width="4"/></g>`;
      case 'headphones':
        return `<g class="acc"><path d="M108 120 C100 60 196 40 214 104" fill="none" stroke="#333" stroke-width="9" stroke-linecap="round"/>
          <rect x="96" y="112" width="22" height="34" rx="10" fill="#F0607A" stroke="${OUT}" stroke-width="4"/></g>`;
      case 'bow':
        return `<g class="acc" transform="translate(150 74)"><path d="M0 0 L-24 -14 L-24 14 Z M0 0 L24 -14 L24 14 Z" fill="#F0607A" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><circle r="6" fill="#F0607A" stroke="${OUT}" stroke-width="4"/></g>`;
      case 'leaf':
        return `<g class="acc"><path d="M156 70 C150 40 176 24 196 30 C198 52 182 72 156 70 Z" fill="#6BBE1F" stroke="${OUT}" stroke-width="4"/><path d="M160 66 L188 36" stroke="${OUT}" stroke-width="3"/></g>`;
      default:
        return '';
    }
  }

  // Outline (shapes) used for clipping liquid into the silhouette.
  function capyClipShapes() {
    return `<path d="${CAPY.earBack}"/><path d="${CAPY.earTop}"/><path d="${CAPY.body}"/>
            <path d="${CAPY.footL}"/><path d="${CAPY.footR}"/>`;
  }

  /* ---------- Surf board (under the capybara) ---------- */
  const BOARD = 'M18 430 C30 404 150 392 300 396 C320 398 330 404 316 412 C300 422 200 448 90 452 C40 454 12 446 18 430 Z';
  function board(color, stripe) {
    return `<path d="${BOARD}" fill="${color}" ${stripe ? `stroke="${OUT}" stroke-width="5"` : ''}/>` +
      (stripe ? `<path d="M40 432 C120 418 230 410 300 404" stroke="${stripe}" stroke-width="10" fill="none" stroke-linecap="round"/>` : '');
  }

  /* ---------- Vessels ---------- */
  // Each vessel lives in a 200 x 220 box. `body` = region liquid can occupy,
  // `top`/`bottom` = y range of that region. `extra` = grey parts (handle, lid…).
  const V = {
    glass: {
      body: 'M22 30 L178 30 L160 196 C158 210 150 214 138 214 L62 214 C50 214 42 210 40 196 Z',
      top: 30, bottom: 214,
    },
    mug: {
      body: 'M16 52 L164 52 L164 140 C164 184 130 210 90 210 C50 210 16 184 16 140 Z',
      top: 52, bottom: 210,
      extra: '<path d="M160 82 C200 76 204 140 156 168" fill="none" stroke="VCOL" stroke-width="16" stroke-linecap="round"/>',
    },
    cup: {
      body: 'M30 48 L170 48 L156 200 C155 210 148 214 138 214 L62 214 C52 214 45 210 44 200 Z',
      top: 48, bottom: 214,
      extra: '<rect x="18" y="26" width="164" height="30" rx="14" fill="VCOL"/><path d="M120 28 L134 2" stroke="VCOL" stroke-width="12" stroke-linecap="round"/>',
    },
    smoothie: {
      body: 'M34 64 L166 64 L152 204 C151 210 146 214 138 214 L62 214 C54 214 49 210 48 204 Z',
      top: 64, bottom: 214,
      extra: '<path d="M26 66 C26 20 174 20 174 66 Z" fill="VCOL"/><path d="M108 30 L130 0" stroke="VCOL" stroke-width="12" stroke-linecap="round"/>',
    },
    bottle: {
      body: 'M74 8 L126 8 L126 34 C126 48 156 56 156 86 L156 200 C156 210 148 216 138 216 L62 216 C52 216 44 210 44 200 L44 86 C44 56 74 48 74 34 Z',
      top: 8, bottom: 216,
    },
    can: {
      body: 'M46 24 L154 24 L162 40 L162 196 C162 210 150 216 140 216 L60 216 C50 216 38 210 38 196 L38 40 Z',
      top: 24, bottom: 216,
    },
    beer: {
      body: 'M36 34 L144 34 L144 200 C144 210 136 216 126 216 L54 216 C44 216 36 210 36 200 Z',
      top: 34, bottom: 216,
      extra: '<path d="M144 70 C190 70 190 170 144 170" fill="none" stroke="VCOL" stroke-width="16"/>',
    },
    wine: {
      body: 'M40 16 L160 16 C164 60 160 120 100 136 C40 120 36 60 40 16 Z',
      top: 16, bottom: 136,
      extra: '<rect x="94" y="132" width="12" height="62" fill="VCOL"/><ellipse cx="100" cy="200" rx="46" ry="12" fill="VCOL"/>',
    },
    rocks: {
      body: 'M24 50 L176 50 L170 196 C169 208 160 214 150 214 L50 214 C40 214 31 208 30 196 Z',
      top: 50, bottom: 214,
    },
  };

  const DECOR = {
    bubbles: (c) => `<g fill="${c}" opacity=".35"><circle cx="70" cy="170" r="4"/><circle cx="120" cy="150" r="3"/><circle cx="96" cy="196" r="5"/><circle cx="140" cy="186" r="3"/></g>`,
    leaves: (c) => `<g fill="none" stroke="${c}" stroke-width="3" opacity=".45">
        <path d="M50 150 q10 -12 22 -4 q-10 12 -22 4 Z"/><path d="M110 176 q12 -10 22 0 q-12 10 -22 0 Z"/><path d="M120 120 q10 -12 20 -2 q-10 10 -20 2 Z"/></g>`,
    teabag: () => `<path d="M90 52 L90 84" stroke="#fff" stroke-width="3"/><path d="M76 84 L104 84 L104 106 C104 116 76 116 76 106 Z" fill="#fff" opacity=".95"/>`,
    lemon: () => `<g fill="#fff" opacity=".9"><path d="M84 124 L104 112 L100 140 Z"/><path d="M106 150 L132 150 L118 172 Z"/><path d="M78 148 L100 154 L84 172 Z"/></g>`,
    ice: (c) => `<g fill="${c}" opacity=".55" stroke="#fff" stroke-opacity=".3" stroke-width="3">
        <rect x="52" y="120" width="40" height="38" rx="9" transform="rotate(-10 72 139)"/><rect x="108" y="108" width="40" height="38" rx="9" transform="rotate(12 128 127)"/>
        <rect x="70" y="164" width="40" height="38" rx="9" transform="rotate(6 90 183)"/><rect x="120" y="158" width="38" height="36" rx="9" transform="rotate(-8 139 176)"/></g>`,
    foam: () => '',
    bolt: () => `<path d="M108 110 L84 156 L102 156 L92 194 L122 140 L104 140 Z" fill="#FFD23F" opacity=".95"/>`,
    seeds: (c) => `<g fill="${c}" opacity=".5"><circle cx="70" cy="150" r="3"/><circle cx="96" cy="168" r="3"/><circle cx="130" cy="140" r="3"/><circle cx="116" cy="190" r="3"/><circle cx="80" cy="196" r="3"/></g>`,
    coco: () => `<g fill="#fff" opacity=".5"><circle cx="80" cy="160" r="5"/><circle cx="120" cy="180" r="4"/></g>`,
  };

  let uid = 0;
  /**
   * Returns an SVG string of a vessel.
   * level: 0..1 liquid level. opts.wave: render animated wave group (.wave) for JS.
   */
  function vessel(type, color, level, opts) {
    opts = opts || {};
    const v = V[type] || V.glass;
    const id = 'v' + (++uid);
    const vcol = opts.vesselColor || '#E9ECEF';
    const y = v.bottom - (v.bottom - v.top) * Math.max(0, Math.min(1, level));
    const deco = opts.decor ? DECOR[opts.decor](shade(color, -25)) : '';
    const foam = opts.decor === 'foam'
      ? `<rect class="foam" x="0" y="-2" width="200" height="20" fill="#FFF8E1"/>` : '';
    return `<svg viewBox="0 0 200 222" class="vessel ${opts.cls || ''}" data-top="${v.top}" data-bottom="${v.bottom}" aria-hidden="true">
      <defs><clipPath id="${id}"><path d="${v.body}"/></clipPath></defs>
      ${(v.extra || '').replace(/VCOL/g, vcol)}
      <path d="${v.body}" fill="${vcol}"/>
      <g clip-path="url(#${id})">
        <g class="liquid" transform="translate(0 ${y.toFixed(1)})">
          <path class="wave" d="${wavePath(0, 0, 220, 6, 0)}" fill="${color}"/>
          <g class="deco" transform="translate(0 ${(-y).toFixed(1)})">${deco}</g>
          ${foam}
        </g>
      </g>
      ${opts.decor === 'teabag' ? DECOR.teabag() : ''}
    </svg>`;
  }

  // Closed path: wave top edge at y=0 then down to `depth`.
  function wavePath(phase, x0, width, amp, tilt, depth) {
    depth = depth || 600;
    const seg = 12;
    let d = '';
    for (let i = 0; i <= seg; i++) {
      const x = x0 - 20 + (width + 40) * i / seg;
      const yy = Math.sin(phase + i * 0.9) * amp + tilt * (i / seg - 0.5);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + yy.toFixed(1);
    }
    return d + `L${x0 + width + 20} ${depth} L${x0 - 20} ${depth} Z`;
  }

  /* ---------- Small helpers ---------- */
  function shade(hex, pct) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = pct / 100;
    const t = f < 0 ? 0 : 255;
    const p = Math.abs(f);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  const ICON = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 8c2.7-2 5.3 2 8 0s5.3-2 8 0M4 13c2.7-2 5.3 2 8 0s5.3-2 8 0M4 18c2.7-2 5.3 2 8 0s5.3-2 8 0"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    updown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9l5-5 5 5M7 15l5 5 5-5"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="10" r="1.8"/><circle cx="12" cy="10" r="1.8"/><circle cx="17" cy="10" r="1.8"/><circle cx="9.5" cy="15" r="1.8"/><circle cx="14.5" cy="15" r="1.8"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s7 7.5 7 12.5A7 7 0 0 1 5 14.5C5 9.5 12 2 12 2z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/></svg>',
    hand: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 11V5a1.5 1.5 0 0 1 3 0v5h.5V3.5a1.5 1.5 0 0 1 3 0V10h.5V5a1.5 1.5 0 0 1 3 0v9c0 4-3 7-7 7-3 0-5-2-6.5-4L3 13.5a1.5 1.5 0 0 1 2.3-1.9L7 13V7a1.5 1.5 0 0 1 2 0z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3"/></svg>',
  };

  /* Alarm clock for the reminders card */
  function alarmClock() {
    return `<svg viewBox="0 0 120 80" class="alarm">
      <g class="alarm-body">
        <rect x="8" y="14" width="104" height="56" rx="14" fill="#5BD0F0" stroke="#1C8FB5" stroke-width="3"/>
        <rect x="18" y="24" width="84" height="36" rx="6" fill="#20203A"/>
        <text x="60" y="51" text-anchor="middle" font-family="'Courier New',monospace" font-weight="700" font-size="22" fill="#FF5577" class="alarm-digits">09:00</text>
        <rect x="40" y="6" width="40" height="10" rx="5" fill="#1C8FB5"/>
        <rect x="22" y="68" width="12" height="8" rx="3" fill="#1C8FB5"/><rect x="86" y="68" width="12" height="8" rx="3" fill="#1C8FB5"/>
      </g>
      <g class="alarm-capy" transform="translate(92 40) scale(.12)">${capybara({})}</g>
    </svg>`;
  }

  /* Phone with widgets for the widget tutorial */
  function widgetPhone() {
    const mini = (x, y, fur) => `<g transform="translate(${x} ${y}) scale(.075)">${capybara({ fur })}</g>`;
    return `<svg viewBox="0 0 200 250" class="widget-phone">
      <rect x="40" y="10" width="120" height="236" rx="22" fill="#2F49C9"/>
      <rect x="44" y="14" width="112" height="228" rx="19" fill="#3A5BEA"/>
      <text x="100" y="44" text-anchor="middle" fill="#fff" opacity=".5" font-size="18" font-weight="700">9:41</text>
      <g class="wg w1"><rect x="52" y="56" width="96" height="40" rx="10" fill="#4F6EF7"/>
        <circle cx="66" cy="76" r="8" fill="#fff" opacity=".85"/><text x="80" y="80" fill="#fff" font-size="11" font-weight="700">1250ml</text>
        ${mini(118, 60, '#E39A5C')}</g>
      <g class="wg w2"><rect x="30" y="104" width="68" height="68" rx="12" fill="#BEEBFA"/>
        <rect x="38" y="148" width="52" height="14" rx="6" fill="#14B4E0"/><rect x="38" y="136" width="44" height="12" rx="6" fill="#6BBE1F"/>
        ${mini(42, 104, '#E39A5C')}</g>
      <g class="wg w3"><rect x="104" y="104" width="68" height="68" rx="12" fill="#FFD23F"/>
        <path d="M110 160 C130 130 150 170 168 140 L168 166 L110 166 Z" fill="#FFA00A"/>
        <path d="M110 150 C128 136 146 158 168 128" stroke="#2747B8" stroke-width="6" fill="none"/></g>
      <g class="wg w4"><rect x="40" y="180" width="120" height="54" rx="12" fill="#B8A5F7"/>
        <circle cx="70" cy="207" r="18" fill="#8E73F0"/>${mini(52, 186, '#C88A55')}
        <rect x="104" y="192" width="40" height="6" rx="3" fill="#14B4E0"/><rect x="104" y="204" width="32" height="6" rx="3" fill="#FFA00A"/><rect x="104" y="216" width="36" height="6" rx="3" fill="#D7263D"/></g>
    </svg>`;
  }

  global.Art = { capybara, capyClipShapes, board, BOARD, vessel, wavePath, shade, ICON, alarmClock, widgetPhone, VESSELS: V };
})(window);
