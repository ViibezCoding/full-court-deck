// ============================================================
// CARD ARTWORK
// Every play card gets its own little scene (160 x 120) with
// the card's name lettered across the bottom (added in views.js).
// The player in the art is the star you're playing as.
//
// Each scene in SCENES below is built from helpers:
//   fig(pose, x, groundY, size, who, options)  draw a player
//   hoop('R' or 'L', rimY)                      a basket
//   arc(...), speed(...), burst(...), big(...)  effects
// Poses are joint positions (head, shoulders, elbows, hands ...)
// in a 200 x 260 box with the feet near y = 234.
// ============================================================
(function (F) {
  const V = F.V;
  let uid = 0;

  // ---------- Extra poses ----------
  const NEW_POSES = {
    stand: { head: [100, 60], neck: [100, 75], shL: [86, 86], shR: [114, 86], elL: [82, 118], haL: [84, 146], elR: [120, 116], haR: [126, 140], ball: [134, 150],
      hipL: [92, 150], hipR: [108, 150], knL: [94, 192], knR: [108, 192], anL: [92, 234], anR: [110, 234] },
    cross: { head: [100, 92], neck: [100, 106], shL: [84, 114], shR: [116, 114], elL: [72, 144], haL: [78, 176], elR: [128, 146], haR: [120, 178], ball: [100, 214],
      hipL: [90, 170], hipR: [110, 170], knL: [74, 206], knR: [128, 204], anL: [70, 244], anR: [134, 244], toeL: [-7, 4], toeR: [7, 4] },
    layup: { head: [106, 62], neck: [104, 76], shL: [92, 82], shR: [114, 80], elR: [126, 50], haR: [132, 24], ball: [137, 14], elL: [84, 108], haL: [80, 132],
      hipL: [94, 148], hipR: [104, 146], knR: [124, 166], anR: [116, 202], knL: [94, 192], anL: [92, 236], toeR: [9, 3], toeL: [2, 10] },
    fade: { head: [88, 62], neck: [92, 77], shL: [80, 88], shR: [104, 86], elL: [78, 60], haL: [92, 36], elR: [112, 56], haR: [104, 32], ball: [98, 20],
      hipL: [98, 150], hipR: [112, 150], knL: [104, 190], knR: [120, 186], anL: [100, 230], anR: [128, 224], toeL: [6, 6], toeR: [8, 4] },
    defend: { head: [100, 74], neck: [100, 89], shL: [84, 98], shR: [116, 98], elL: [62, 104], haL: [46, 96], elR: [138, 104], haR: [154, 96],
      hipL: [90, 158], hipR: [110, 158], knL: [74, 194], knR: [126, 194], anL: [70, 234], anR: [130, 234], toeL: [-6, 4], toeR: [6, 4] },
    contest: { head: [100, 58], neck: [100, 73], shL: [86, 84], shR: [114, 84], elL: [84, 54], haL: [86, 24], elR: [116, 54], haR: [114, 24],
      hipL: [92, 148], hipR: [108, 148], knL: [94, 188], knR: [108, 188], anL: [90, 226], anR: [112, 226] },
    block: { head: [104, 54], neck: [103, 69], shL: [90, 78], shR: [116, 78], elR: [126, 44], haR: [130, 12], ball: [138, 2], elL: [80, 102], haL: [76, 128],
      hipL: [96, 142], hipR: [108, 142], knL: [90, 178], knR: [116, 174], anL: [84, 212], anR: [118, 208], toeL: [-3, 6], toeR: [6, 4] },
    steal: { head: [122, 88], neck: [116, 98], shL: [104, 104], shR: [124, 108], elR: [146, 150], haR: [164, 186], elL: [92, 128], haL: [96, 150],
      hipL: [90, 160], hipR: [100, 160], knR: [124, 190], anR: [132, 232], knL: [70, 196], anL: [52, 226], toeR: [8, 2], toeL: [-6, 6] },
    pass: { head: [96, 60], neck: [98, 75], shL: [90, 86], shR: [106, 86], elL: [112, 104], haL: [132, 102], elR: [118, 98], haR: [136, 96], ball: [146, 99],
      hipL: [94, 150], hipR: [104, 150], knR: [118, 190], anR: [124, 232], knL: [88, 192], anL: [78, 232], toeR: [8, 2], toeL: [6, 4] },
    hook: { head: [96, 62], neck: [96, 77], shL: [86, 88], shR: [106, 86], elR: [120, 52], haR: [110, 22], ball: [104, 12], elL: [74, 104], haL: [64, 96],
      hipL: [92, 150], hipR: [102, 150], knR: [110, 190], anR: [112, 232], knL: [86, 186], anL: [80, 214], toeR: [8, 2], toeL: [6, 4] },
    granny: { head: [100, 70], neck: [100, 85], shL: [86, 96], shR: [114, 96], elL: [90, 124], haL: [96, 150], elR: [110, 124], haR: [104, 150], ball: [100, 160],
      hipL: [90, 156], hipR: [110, 156], knL: [80, 196], knR: [120, 196], anL: [84, 236], anR: [116, 236] },
    tired: { head: [104, 96], neck: [100, 108], shL: [88, 114], shR: [112, 116], elL: [84, 144], haL: [90, 172], elR: [118, 144], haR: [110, 172],
      hipL: [84, 152], hipR: [100, 152], knL: [90, 192], knR: [106, 192], anL: [86, 234], anR: [110, 234] },
  };

  function pose(name) {
    const P = NEW_POSES[name] || V.POSES[name];
    return Object.assign({ toeL: [-4, 6], toeR: [4, 6], far: 'L' }, P);
  }

  // ---------- Team colors ----------
  const OPP = { number: 4, colors: { jersey: '#a3222d', jerseyLight: '#c43a44', jerseyDark: '#6d141c', trim: '#f4f4f2',
    skin: '#c48a5e', skinLight: '#d9a37a', skinDark: '#8e5f3c', hair: '#2a1a12', headband: false, beard: false } };
  const DEFAULT_ME = { number: 1, colors: { jersey: '#1d2a52', jerseyLight: '#2e3f75', jerseyDark: '#121a36', trim: '#F26A1B',
    skin: '#8d5b3b', skinLight: '#a87350', skinDark: '#5e3a24', hair: '#1a120d', headband: false, beard: false } };

  const TINT = { shot: '#F26A1B', defense: '#4D8DFF', play: '#3FCB7E', auto: '#E8B33C', status: '#8E98B5' };

  // Small repeatable random numbers so each card always looks the same
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const hash = s => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 2147483647; return h || 1; };

  // ---------- The scene kit ----------
  function kit(p, me, style) {
    const mate = { ...me, number: me.number === 7 ? 8 : 7 };
    const who = w => (w === 'opp' ? OPP : w === 'mate' ? mate : me);
    const outline = style === 'comic' ? `url(#${p}ol)` : `url(#${p}rim)`;

    // Where a pose's joint (default: the ball) ends up in the scene
    function at(poseName, cx, gy, s, flip, key = 'ball') {
      const [x, y] = pose(poseName)[key];
      return [cx + (flip ? -1 : 1) * (x - 100) * s, gy - (234 - y) * s];
    }

    // Draw a player: pose, center x, ground y, size, 'me' | 'mate' | 'opp'
    function fig(poseName, cx, gy, s, w = 'me', o = {}) {
      const flip = !!o.flip;
      const tx = flip ? cx + 100 * s : cx - 100 * s;
      const ty = gy - 234 * s;
      const inner = `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${flip ? -s : s} ${s})">${V.drawPlayer(pose(poseName), who(w), flip)}</g>`;
      const rot = o.rot ? ` transform="rotate(${o.rot} ${cx} ${gy})"` : '';
      const blur = o.ghost ? ` filter="url(#${p}gh)"` : ` filter="${outline}"`;
      return `<g opacity="${o.op != null ? o.op : 1}"${rot}><g${blur}>${inner}</g></g>`;
    }

    function hoop(side = 'R', rimY = 40) {
      const g = `<rect x="152" y="${rimY - 8}" width="3" height="${84 - rimY}" fill="#3a4058"/>
        <rect x="146" y="${rimY - 14}" width="3.5" height="20" rx="1" fill="#e9edf5"/>
        <path d="M132 ${rimY + 2} H147" stroke="#F26A1B" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M133 ${rimY + 3} L136 ${rimY + 13} M139.5 ${rimY + 3} V${rimY + 14} M146 ${rimY + 3} L143 ${rimY + 13} M134.5 ${rimY + 8} H144.5" stroke="#f4f4f2" stroke-width=".7" opacity=".9"/>`;
      return side === 'L' ? `<g transform="translate(160 0) scale(-1 1)">${g}</g>` : g;
    }
    const rim = (side = 'R', rimY = 40) => (side === 'L' ? [20.5, rimY + 2] : [139.5, rimY + 2]);

    // Dotted ball flight from (x1,y1) to (x2,y2) bending through (qx,qy)
    const arc = (x1, y1, qx, qy, x2, y2, col = '#fff') =>
      `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q${qx} ${qy} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${col}" stroke-opacity=".75" stroke-width="1.2" stroke-dasharray="2 3" stroke-linecap="round"/>`;
    const line = (x1, y1, x2, y2, col = '#fff') =>
      `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${col}" stroke-opacity=".75" stroke-width="1.2" stroke-dasharray="2 3" stroke-linecap="round"/>`;
    const arrowHead = (x, y, ang, col = '#fff') =>
      `<path d="M-4 -3 L0 0 L-4 3" transform="translate(${x} ${y}) rotate(${ang})" fill="none" stroke="${col}" stroke-opacity=".85" stroke-width="1.3" stroke-linecap="round"/>`;
    // Horizontal motion lines ending at x, starting at y, going down
    const speed = (x, y, n = 3, len = 22, gap = 9, col = '#fff3d6') =>
      Array.from({ length: n }, (_, i) => `<path d="M${x - len + (i % 2) * 6} ${y + i * gap} H${x}" stroke="${col}" stroke-opacity=".55" stroke-width="1.3" stroke-linecap="round"/>`).join('');
    const burst = (x, y, r, col = '#ffd27a', op = .9) => {
      let pts = '';
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, rr = i % 2 ? r * 0.45 : r; pts += `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)} `; }
      return `<polygon points="${pts}" fill="${col}" opacity="${op}"/>`;
    };
    const ball = (x, y, r = 4.5) => V.basketball(x, y, r);
    const big = (t, x, y, size, col = '#F26A1B', op = .16) =>
      `<text x="${x}" y="${y}" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="${size}" fill="${col}" opacity="${op}">${t}</text>`;
    const drops = (x, y) => `<g fill="#9cc3ff" opacity=".85"><path d="M${x} ${y} q-2 4 0 5 q2 -1 0 -5z"/><path d="M${x + 8} ${y - 6} q-2 4 0 5 q2 -1 0 -5z"/><path d="M${x - 7} ${y - 4} q-1.6 3 0 4 q1.6 -1 0 -4z"/></g>`;
    const glow = (x, y, r, col, op = .5) => `<circle cx="${x.toFixed ? x.toFixed(1) : x}" cy="${y.toFixed ? y.toFixed(1) : y}" r="${r}" fill="${col}" opacity="${op}" filter="url(#${p}gf)"/>`;

    return { fig, at, hoop, rim, arc, line, arrowHead, speed, burst, ball, big, drops, glow, p };
  }

  // ---------- Backgrounds ----------
  function arenaBg(p, tint, seed) {
    const r = rng(seed);
    let lights = '';
    const cols = ['#ffd27a', '#ff9a5a', '#a9c3ff', '#ffffff'];
    for (let i = 0; i < 18; i++) lights += `<circle cx="${(r() * 160).toFixed(0)}" cy="${(4 + r() * 66).toFixed(0)}" r="${(1.5 + r() * 4).toFixed(1)}" fill="${cols[i % 4]}" opacity="${(0.15 + r() * 0.3).toFixed(2)}"/>`;
    return `<rect width="160" height="120" fill="url(#${p}sky)"/>
      <g filter="url(#${p}bl)">${lights}</g>
      <ellipse cx="80" cy="54" rx="56" ry="42" fill="${tint}" opacity=".28" filter="url(#${p}gf)"/>
      <path d="M0 80 H160 V120 H0Z" fill="url(#${p}fl)"/>
      <path d="M0 88 H160 M0 99 H160 M0 112 H160" stroke="rgba(60,30,10,.3)" stroke-width=".6"/>
      <path d="M58 0 L102 0 L134 120 L26 120Z" fill="#fff6dc" opacity=".07"/>`;
  }
  function comicBg(p) {
    let rays = '';
    for (let i = 0; i < 20; i++) {
      const a1 = (i / 20) * Math.PI * 2, a2 = ((i + 0.5) / 20) * Math.PI * 2;
      rays += `<polygon points="80,50 ${(80 + Math.cos(a1) * 200).toFixed(0)},${(50 + Math.sin(a1) * 200).toFixed(0)} ${(80 + Math.cos(a2) * 200).toFixed(0)},${(50 + Math.sin(a2) * 200).toFixed(0)}" fill="#FFE27A"/>`;
    }
    return `<rect width="160" height="120" fill="#FFD23F"/>${rays}
      <rect width="160" height="120" fill="url(#${p}dots)"/>
      <path d="M0 86 H160 V120 H0Z" fill="#f08a3c"/><path d="M0 86 H160" stroke="#111" stroke-width="1.5"/>`;
  }

  function defs(p, style) {
    return `<defs>
      <linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3150"/><stop offset="1" stop-color="#0e1224"/></linearGradient>
      <linearGradient id="${p}fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a32"/><stop offset="1" stop-color="#c58e58"/></linearGradient>
      <filter id="${p}gf" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
      <filter id="${p}bl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
      <filter id="${p}gh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.1"/></filter>
      <filter id="${p}rim" x="-15%" y="-15%" width="130%" height="130%"><feDropShadow dx="-.7" dy="-.4" stdDeviation=".3" flood-color="#fff1d6" flood-opacity=".65"/></filter>
      ${style === 'comic' ? `<pattern id="${p}dots" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".9" fill="#e08a00" opacity=".55"/></pattern>
        <filter id="${p}ol" x="-15%" y="-15%" width="130%" height="130%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.3" result="d"/><feFlood flood-color="#111"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : ''}
    </defs>`;
  }

  // ---------- Every card's scene ----------
  // h = scene kit. Most scenes put a basket on the right and the player on the left.
  const SCENES = {
    // ---- Scoring ----
    corner_three: h => {
      const [bx, by] = h.at('shot', 40, 104, 0.44);
      const [rx, ry] = h.rim();
      return h.big('3', 100, 80, 72) + `<path d="M6 120 Q16 98 22 82" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" fill="none"/>` + h.hoop() + h.fig('shot', 40, 104, 0.44) + h.arc(bx, by, 96, -18, rx, ry);
    },
    step_back: h => {
      const [bx, by] = h.at('fade', 54, 100, 0.44);
      const [rx, ry] = h.rim();
      return h.hoop() + h.fig('contest', 108, 106, 0.42, 'opp', { flip: true }) + h.speed(46, 92, 2, 14, 6) + h.fig('fade', 54, 100, 0.44) +
        h.line(84, 112, 64, 112) + h.arrowHead(62, 112, 180) + h.arc(bx, by, 104, -16, rx, ry);
    },
    pull_up: h => {
      const [bx, by] = h.at('shot', 64, 96, 0.44);
      const [rx, ry] = h.rim();
      return h.hoop() + h.fig('run', 38, 104, 0.4, 'me', { ghost: true, op: 0.25 }) + h.speed(44, 46, 3, 20, 10) + h.fig('shot', 64, 96, 0.44) + h.arc(bx, by, 108, -10, rx, ry);
    },
    fadeaway: h => {
      const [bx, by] = h.at('fade', 56, 98, 0.44);
      const [rx, ry] = h.rim();
      return h.hoop() + h.fig('contest', 104, 106, 0.42, 'opp', { flip: true }) +
        `<path d="M40 108 q-8 -2 -14 -8 M44 114 q-10 -2 -18 -10" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" fill="none"/>` + h.fig('fade', 56, 98, 0.44) + h.arc(bx, by, 108, -18, rx, ry);
    },
    floater: h => {
      const [bx, by] = h.at('layup', 60, 104, 0.42);
      const [rx, ry] = h.rim();
      return h.hoop() + h.fig('contest', 108, 106, 0.5, 'opp', { flip: true }) + h.fig('layup', 60, 104, 0.42) + h.arc(bx, by, 100, -30, rx, ry);
    },
    layup: h => h.hoop('R', 26) + h.speed(70, 40, 3, 18, 9) + h.fig('layup', 104, 112, 0.46),
    driving_dunk: h => h.hoop('R', 28) + h.fig('dunk', 82, 122, 0.46, 'me', { ghost: true, op: 0.22 }) + h.speed(78, 30, 3, 26, 10) + h.fig('dunk', 104, 120, 0.46),
    alley_oop: h => {
      const [mx, my] = h.at('pass', 24, 104, 0.3);
      const [bx, by] = h.at('dunk', 104, 120, 0.46);
      return h.hoop('R', 28) + h.fig('pass', 24, 104, 0.3, 'mate', { op: 0.9 }) + h.arc(mx, my, 64, -26, bx, by) + h.fig('dunk', 104, 120, 0.46);
    },
    posterizer: h => h.burst(20, 18, 10, '#fff', .55) + h.burst(148, 66, 8, '#fff', .45) + h.burst(28, 62, 6, '#fff', .4) +
      h.hoop('R', 30) + h.fig('contest', 122, 118, 0.42, 'opp', { flip: true }) + h.speed(70, 24, 3, 22, 10) + h.fig('dunk', 96, 110, 0.5),
    and_one: h => h.hoop('R', 26) + h.fig('block', 132, 118, 0.42, 'opp', { flip: true }) + h.fig('layup', 98, 112, 0.46) +
      h.burst(122, 50, 7, '#ffd27a', .9) + `<text x="30" y="40" text-anchor="middle" font-family="Big Shoulders Display, Impact" font-weight="900" font-size="22" fill="#ffd27a">+1</text>`,
    fast_break: h => `<path d="M118 80 L112 120" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>` + h.hoop('R', 44) +
      h.fig('run', 34, 104, 0.44, 'me', { ghost: true, op: 0.15 }) + h.fig('run', 52, 104, 0.44, 'me', { ghost: true, op: 0.3 }) + h.speed(56, 34, 3, 26, 10) + h.fig('run', 72, 104, 0.46),
    putback: h => {
      const [rx, ry] = h.rim('R', 30);
      return h.hoop('R', 30) + `<path d="M${rx - 6} ${ry - 2} q-6 -14 -4 -22" fill="none" stroke="#fff" stroke-opacity=".6" stroke-dasharray="2 3" stroke-width="1.1"/>` + h.fig('block', 108, 112, 0.46);
    },

    // ---- Defense ----
    contest: h => h.hoop() + h.fig('shot', 64, 102, 0.42, 'opp') + h.fig('contest', 92, 106, 0.46, 'me', { flip: true }) + h.glow(92, 50, 40, '#4D8DFF', .35),
    swipe: h => {
      const [bx, by] = h.at('cross', 112, 98, 0.42, true);
      return h.fig('cross', 112, 98, 0.42, 'opp', { flip: true }) + h.fig('steal', 64, 106, 0.46) + h.burst(bx, by, 8, '#ffd27a', .85) + h.ball(bx, by, 4);
    },
    box_out: h => h.hoop('R', 22) + h.ball(104, 14, 4.5) + `<path d="M100 22 l-3 6 M108 22 l3 6" stroke="#fff" stroke-opacity=".6" stroke-width="1"/>` +
      h.fig('contest', 106, 106, 0.44, 'opp', { flip: true }) + h.fig('defend', 70, 106, 0.46),
    lockdown: h => h.glow(62, 60, 44, '#4D8DFF', .5) + h.fig('cross', 114, 104, 0.42, 'opp', { flip: true }) + h.fig('defend', 62, 104, 0.48) +
      `<g transform="translate(140 16)"><rect x="-6" y="0" width="12" height="10" rx="2" fill="#4D8DFF"/><path d="M-3.5 0 V-3.5 a3.5 3.5 0 0 1 7 0 V0" fill="none" stroke="#4D8DFF" stroke-width="2"/></g>`,
    block_party: h => {
      const [bx, by] = h.at('block', 72, 118, 0.48);
      return h.fig('shot', 116, 106, 0.4, 'opp', { flip: true }) + h.burst(bx, by, 16, '#F26A1B', .9) + h.burst(bx, by, 9, '#ffd27a', 1) +
        `<g fill="#ffd27a"><rect x="20" y="20" width="3" height="2" transform="rotate(30 20 20)"/><rect x="40" y="10" width="3" height="2" fill="#4D8DFF"/><rect x="120" y="14" width="3" height="2" fill="#3FCB7E"/><rect x="140" y="30" width="3" height="2"/></g>` +
        h.fig('block', 72, 118, 0.48);
    },
    take_charge: h => h.fig('run', 104, 104, 0.44, 'opp', { flip: true }) + h.burst(80, 50, 10, '#fff', .7) + h.fig('stand', 56, 106, 0.44, 'me', { rot: -28 }) +
      `<g transform="translate(132 20)"><circle r="6" fill="#e9edf5"/><rect x="2" y="-3" width="9" height="5" rx="2" fill="#e9edf5"/><path d="M14 -6 l5 -3 M14 0 h6 M14 6 l5 3" stroke="#fff" stroke-width="1.2"/></g>`,
    full_court_press: h => `<path d="M80 80 L80 120" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>` + h.fig('cross', 80, 94, 0.3, 'opp', { flip: true }) +
      h.fig('defend', 28, 104, 0.34) + h.fig('defend', 80, 112, 0.36) + h.fig('defend', 132, 104, 0.34),

    // ---- Playmaking ----
    no_look: h => {
      const [bx, by] = h.at('pass', 46, 104, 0.46);
      return h.fig('defend', 94, 104, 0.36, 'opp', { flip: true }) + h.fig('pass', 46, 104, 0.46) + h.line(bx, by, 132, 64) +
        h.fig('contest', 140, 104, 0.36, 'mate', { flip: true }) + `<path d="M40 30 l-14 -6" stroke="#fff" stroke-opacity=".5" stroke-width="1" stroke-dasharray="1.5 2.5"/>` + h.arrowHead(26, 24, 200);
    },
    bounce_pass: h => {
      const [bx, by] = h.at('pass', 40, 104, 0.44);
      return h.fig('pass', 40, 104, 0.44) + h.line(bx, by, 92, 104) + h.line(92, 104, 126, 68) +
        `<ellipse cx="92" cy="105" rx="5" ry="1.5" fill="#fff" opacity=".5"/>` + h.fig('contest', 136, 104, 0.38, 'mate', { flip: true });
    },
    behind_back: h => h.fig('defend', 128, 104, 0.4, 'opp', { flip: true, ghost: true, op: 0.6 }) +
      `<ellipse cx="76" cy="84" rx="24" ry="7" fill="none" stroke="#fff3d6" stroke-opacity=".7" stroke-width="1.3" stroke-dasharray="2 3"/>` + h.fig('cross', 76, 104, 0.5),
    hustle: h => h.speed(48, 36, 3, 24, 10) + `<g fill="#cfc3b0" opacity=".5"><circle cx="40" cy="104" r="5"/><circle cx="32" cy="101" r="3.5"/><circle cx="48" cy="106" r="3"/></g>` +
      h.fig('run', 74, 104, 0.46) + h.drops(80, 20),
    pick_roll: h => h.hoop() + h.fig('defend', 104, 104, 0.4, 'opp', { flip: true }) + h.fig('stand', 84, 104, 0.42, 'mate') +
      `<path d="M50 100 Q70 118 100 112 Q122 104 128 70" fill="none" stroke="#fff3d6" stroke-opacity=".7" stroke-width="1.3" stroke-dasharray="2 3"/>` + h.arrowHead(128, 70, -80) + h.fig('run', 44, 104, 0.44),
    iso: h => `<rect width="160" height="120" fill="#000" opacity=".35"/><path d="M54 0 L86 0 L104 120 L30 120Z" fill="#fff6dc" opacity=".22"/>` +
      h.fig('defend', 118, 104, 0.42, 'opp', { flip: true }) + h.fig('cross', 66, 104, 0.5),

    // ---- Autographs (the star posing; the card adds an AUTO stamp) ----
    auto_sharp: h => {
      const [bx, by] = h.at('shot', 80, 104, 0.48);
      return h.big('3', 80, 88, 90, '#E8B33C', .18) + h.fig('shot', 80, 104, 0.48) + h.glow(bx, by, 12, '#ff5a1f', .9) + h.ball(bx, by, 5);
    },
    auto_floor: h => `<g stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"><path d="M20 30 l8 8 M28 30 l-8 8"/><circle cx="130" cy="26" r="5"/><path d="M30 40 Q70 20 122 28" stroke-dasharray="2 3"/></g>` +
      h.fig('pass', 72, 104, 0.5),
    auto_lock: h => `<path d="M80 12 l30 10 v22 c0 20 -14 32 -30 38 c-16 -6 -30 -18 -30 -38 v-22z" fill="#4D8DFF" opacity=".25"/>` + h.fig('defend', 80, 106, 0.5),
    auto_iron: h => h.fig('stand', 80, 104, 0.5) + `<path d="M70 44 l8 -2 l4 26 l-8 2z" fill="#f4f1ea" opacity=".95"/>` + h.burst(30, 24, 6, '#E8B33C') + h.burst(132, 30, 5, '#E8B33C'),
    auto_high: h => h.hoop('R', 26) + `<g fill="#fff" opacity=".25"><ellipse cx="34" cy="76" rx="18" ry="6"/><ellipse cx="54" cy="70" rx="12" ry="5"/></g>` +
      h.speed(70, 36, 3, 24, 9, '#E8B33C') + h.fig('dunk', 100, 118, 0.5),
    auto_closer: h => `<g transform="translate(20 10)"><rect width="34" height="18" rx="2" fill="#0b0d14" stroke="#3a4058"/><text x="17" y="14" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="#ff4d4d">0.0</text></g>` +
      h.hoop() + h.fig('shot', 70, 100, 0.48) + (() => { const [bx, by] = h.at('shot', 70, 100, 0.48); const [rx, ry] = h.rim(); return h.arc(bx, by, 110, -10, rx, ry); })(),

    // ---- Classic moves (Scoring and Playmaking) ----
    sky_hook: h => { const [bx, by] = h.at('hook', 72, 104, 0.48); const [rx, ry] = h.rim(); return h.hoop() + h.fig('hook', 72, 104, 0.48) + h.arc(bx, by, 110, -20, rx, ry); },
    granny_shot: h => {
      const [bx, by] = h.at('granny', 62, 104, 0.46);
      const [rx, ry] = h.rim();
      return `<path d="M30 108 H100" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>` + h.hoop() + h.fig('granny', 62, 104, 0.46) + h.arc(bx, by, 96, -24, rx, ry);
    },
    short_shorts: h => {
      let rays = ''; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; rays += `<path d="M80 50 L${(80 + Math.cos(a) * 120).toFixed(0)} ${(50 + Math.sin(a) * 120).toFixed(0)}" stroke="#e8a14a" stroke-width="10" opacity=".22"/>`; }
      return rays + h.fig('stand', 80, 104, 0.5) + h.burst(118, 30, 6, '#fff');
    },

    // ---- Showtime (comic style) ----
    st_heave: h => { const [bx, by] = h.at('shot', 34, 104, 0.42); const [rx, ry] = h.rim('R', 44); return h.hoop('R', 44) + h.fig('shot', 34, 104, 0.42) + h.arc(bx, by, 96, -50, rx, ry, '#111'); },
    st_windmill: h => { const [sx, sy] = h.at('dunk', 98, 118, 0.48, false, 'shR'); return h.hoop('R', 26) + `<circle cx="${sx}" cy="${sy}" r="20" fill="none" stroke="#111" stroke-width="1.6" stroke-dasharray="4 4"/>` + h.fig('dunk', 98, 118, 0.48); },
    st_ankle: h => h.fig('stand', 104, 84, 0.36, 'opp', { rot: 72 }) +
      `<g fill="#E63946" stroke="#111" stroke-width=".6">${[0, 1, 2].map(i => `<polygon points="${118 + i * 9},36 ${120 + i * 9},40 ${124 + i * 9},40 ${121 + i * 9},43 ${122 + i * 9},47 ${118 + i * 9},44 ${114 + i * 9},47 ${115 + i * 9},43 ${112 + i * 9},40 ${116 + i * 9},40" />`).join('')}</g>` + h.fig('cross', 52, 104, 0.48),
    st_chasedown: h => { const [bx, by] = h.at('block', 78, 116, 0.48); return h.hoop('R', 30) + h.fig('layup', 112, 112, 0.42, 'opp') + h.burst(bx, by, 14, '#E63946') + h.fig('block', 78, 116, 0.48); },
    st_dime: h => {
      const [bx, by] = h.at('pass', 44, 104, 0.46);
      return h.fig('pass', 44, 104, 0.46) + h.line(bx, by, 132, 64, '#111') + h.burst(96, 82, 5, '#fff', 1) + h.burst(116, 72, 4, '#fff', 1) + h.fig('contest', 140, 104, 0.38, 'mate', { flip: true });
    },

    // ---- Status ----
    tired_legs: h => h.fig('tired', 80, 110, 0.62) + h.drops(88, 26),
  };

  // Build a card's artwork. Returns null if the card has no scene.
  V.cardArt = (card, run) => {
    const d = F.CARDS[card.id];
    const scene = SCENES[card.id];
    if (!scene) return null;
    const p = `ca${uid++}_`;
    const me = (run && F.CHARACTERS[run.charId]) || DEFAULT_ME;
    const style = d.pool === 'showtime' ? 'comic' : 'normal';
    const h = kit(p, me, style);
    const bg = style === 'comic' ? comicBg(p) : arenaBg(p, TINT[d.type] || '#fff', hash(card.id));
    const body = bg + scene(h);
    // Anchored to the top: if a card's picture is shorter, the bottom (behind the name) is trimmed, not the heads
    return `<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${defs(p, style)}${body}</svg>`;
  };
  V.hasCardArt = id => !!SCENES[id];
})(FCD);
