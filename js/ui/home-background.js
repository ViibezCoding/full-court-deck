// Home screen background: "Stars in Motion".
// The King dunks on the left basket, The Chef shoots a 3 toward the right
// basket, spotlights sweep and the crowd lights twinkle.
// Player colors come from js/data/characters.js.
(function (F) {
  // Player poses (local coordinates, about 240 units tall)
  const POSES = {
    shot: { head: [100, 60], neck: [100, 75], shL: [88, 84], shR: [112, 84], elL: [86, 58], elR: [120, 56], haL: [100, 34], haR: [112, 30], ball: [107, 19],
            hipL: [92, 150], hipR: [108, 150], knL: [96, 192], knR: [108, 190], anL: [93, 234], anR: [110, 232], toeL: [3, 9], toeR: [3, 9], far: 'L' },
    dunk: { head: [112, 68], neck: [107, 82], shL: [96, 88], shR: [116, 86], elR: [134, 58], haR: [146, 30], ball: [152, 20], elL: [84, 114], haL: [78, 140],
            hipL: [92, 152], hipR: [102, 150], knL: [116, 188], anL: [104, 222], knR: [86, 194], anR: [72, 226], toeL: [9, 3], toeR: [-1, 10], far: 'L' },
  };

  // A realistic basketball: orange leather, shading, and the black seams
  // (one across, one down, and two curved side seams)
  function basketball(x, y, r) {
    const k = r * 0.72;
    const w = Math.max(0.7, r * 0.11);
    return `<g>
      <circle cx="${x}" cy="${y}" r="${r}" fill="#d9611c"/>
      <path d="M${x - r * 0.15} ${y + r * 0.99} A${r} ${r} 0 0 0 ${x + r * 0.99} ${y - r * 0.15} A${r * 1.15} ${r * 1.15} 0 0 1 ${x - r * 0.15} ${y + r * 0.99}Z" fill="#7a2c0a" opacity=".45"/>
      <ellipse cx="${x - r * 0.38}" cy="${y - r * 0.42}" rx="${r * 0.32}" ry="${r * 0.2}" transform="rotate(-35 ${x - r * 0.38} ${y - r * 0.42})" fill="#ffd2a8" opacity=".55"/>
      <g stroke="#1a0d05" stroke-width="${w}" fill="none" stroke-linecap="round">
        <path d="M${x - r} ${y} H${x + r}"/>
        <path d="M${x} ${y - r} V${y + r}"/>
        <path d="M${x - k} ${y - k} Q${x - r * 0.22} ${y} ${x - k} ${y + k}"/>
        <path d="M${x + k} ${y - k} Q${x + r * 0.22} ${y} ${x + k} ${y + k}"/>
      </g>
      <circle cx="${x}" cy="${y}" r="${r - w / 2}" fill="none" stroke="#1a0d05" stroke-width="${w * 0.9}" opacity=".85"/>
    </g>`;
  }
  F.V.basketball = basketball;

  // Simple face: brows, eyes, nose, mouth, and a beard for players who have one
  function face([hx, hy], c) {
    let s = `<path d="M${hx - 7} ${hy - 3} L${hx - 2.5} ${hy - 3.8} M${hx + 2.5} ${hy - 3.8} L${hx + 7} ${hy - 3}" stroke="${c.hair}" stroke-width="1.3" stroke-linecap="round"/>
      <ellipse cx="${hx - 4.5}" cy="${hy - 0.5}" rx="1.4" ry="1.1" fill="#140c08"/>
      <ellipse cx="${hx + 4.5}" cy="${hy - 0.5}" rx="1.4" ry="1.1" fill="#140c08"/>
      <path d="M${hx} ${hy + 0.5} Q${hx - 1.2} ${hy + 3.6} ${hx} ${hy + 4.4} Q${hx + 1.3} ${hy + 4.6} ${hx + 2} ${hy + 4}" stroke="${c.skinDark}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    if (c.beard) s += `<path d="M${hx - 10} ${hy + 1} Q${hx - 9} ${hy + 11} ${hx} ${hy + 12.5} Q${hx + 9} ${hy + 11} ${hx + 10} ${hy + 1} Q${hx + 7} ${hy + 8} ${hx} ${hy + 8.5} Q${hx - 7} ${hy + 8} ${hx - 10} ${hy + 1} Z" fill="${c.hair}" opacity=".9"/>`;
    s += `<path d="M${hx - 3.5} ${hy + 7} Q${hx} ${hy + 9.6} ${hx + 3.5} ${hy + 7}" stroke="${c.beard ? '#f2e3d0' : '#3a1e14'}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
    return s;
  }

  // Draw one player in team colors. flip = the player is mirrored (keeps the jersey number readable)
  function player(P, ch, flip) {
    const c = ch.colors;
    const L = (a, b, w, col, extra = '') => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
    const add = (a, d) => [a[0] + d[0], a[1] + d[1]];
    const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const near = P.far === 'L' ? 'R' : 'L';
    const far = P.far;
    const hl = () => ''; // no highlight streaks: one even skin tone
    const arm = (s, col) => L(P['sh' + s], P['el' + s], 10, col) + L(P['el' + s], P['ha' + s], 8, col)
      + `<circle cx="${P['ha' + s][0]}" cy="${P['ha' + s][1]}" r="5" fill="${col}"/>` + hl(P['sh' + s], P['el' + s], 10) + hl(P['el' + s], P['ha' + s], 8);
    const leg = (s, col) => L(P['hip' + s], P['kn' + s], 15, col) + L(P['kn' + s], P['an' + s], 11, col) + hl(P['kn' + s], P['an' + s], 11)
      + L(P['an' + s], add(P['an' + s], P['toe' + s]), 10, '#f2f2f2');
    const thigh = s => mix(P['hip' + s], P['kn' + s], 0.5);
    const parts = [];
    parts.push(arm(far, c.skin));
    parts.push(leg(far, c.skin));
    parts.push(`<path d="M${P.hipL} L${P.hipR} L${thigh('R')} L${thigh('L')} Z" fill="${c.jerseyDark}" stroke="${c.jerseyDark}" stroke-width="16" stroke-linejoin="round"/>`);
    parts.push(leg(near, c.skin));
    parts.push(`<path d="M${P.hipR} L${thigh(near)}" stroke="${c.jerseyDark}" stroke-width="16" stroke-linecap="round"/>`);
    parts.push(`<path d="M${P.shL} L${P.shR} L${add(P.hipR, [3, 0])} L${add(P.hipL, [-3, 0])} Z" fill="${c.jersey}" stroke="${c.jersey}" stroke-width="9" stroke-linejoin="round"/>`);
    parts.push(`<path d="M${mix(P.shL, P.neck, 0.5)} L${mix(P.neck, mix(P.hipL, P.hipR, 0.5), 0.2)} L${mix(P.shR, P.neck, 0.5)}" stroke="${c.trim}" stroke-width="2.5" fill="none"/>`);
    const cx = (P.shL[0] + P.shR[0] + P.hipL[0] + P.hipR[0]) / 4;
    const cy = (P.shL[1] + P.shR[1] + P.hipL[1] + P.hipR[1]) / 4 + 4;
    parts.push(`<text x="${cx}" y="${cy}" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="18" fill="${c.trim}" ${flip ? `transform="translate(${2 * cx} 0) scale(-1 1)"` : ''}>${ch.number}</text>`);
    parts.push(L(P.neck, P.head, 9, c.skin));
    parts.push(`<circle cx="${P.head[0]}" cy="${P.head[1]}" r="12" fill="${c.skin}"/>`);
    parts.push(`<path d="M${P.head[0] - 12} ${P.head[1] - 2} A12 12 0 0 1 ${P.head[0] + 12} ${P.head[1] - 2} Q${P.head[0]} ${P.head[1] - 8} ${P.head[0] - 12} ${P.head[1] - 2} Z" fill="${c.hair}"/>`);
    if (c.headband) parts.push(`<path d="M${P.head[0] - 12} ${P.head[1] - 4} Q${P.head[0]} ${P.head[1] - 10} ${P.head[0] + 12} ${P.head[1] - 4}" stroke="#f4f4f2" stroke-width="3.5" fill="none"/>`);
    if (!P.noFace) parts.push(face(P.head, c));
    parts.push(arm(near, c.skin));
    if (P.ball) parts.push(basketball(P.ball[0], P.ball[1], 11));
    return parts.join('');
  }

  // Basket on the left edge (mirror it for the right side)
  function hoop() {
    return `<g transform="translate(60 210) scale(1.45)">
      <rect x="-14" y="40" width="10" height="1000" fill="#3a4058"/>
      <path d="M-9 60 L14 60" stroke="#3a4058" stroke-width="8"/>
      <rect x="12" y="-30" width="8" height="120" rx="2" fill="#e9edf5"/>
      <path d="M20 58 L80 58" stroke="#F26A1B" stroke-width="5" stroke-linecap="round"/>
      <path d="M24 60 L32 104 M40 60 L42 106 M58 60 L54 106 M76 60 L66 104 M28 80 L72 80 M32 96 L66 96" stroke="#f4f4f2" stroke-width="1.6" fill="none"/>
    </g>`;
  }

  const place = (inner, x, y, s, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${inner}</g>`;

  // Running dribble, side view facing right (used on the Coast to Coast card)
  POSES.run = {
    head: [120, 56], neck: [116, 70], shL: [106, 78], shR: [120, 80], elR: [136, 110], haR: [146, 138], ball: [150, 168],
    elL: [92, 104], haL: [78, 122], hipL: [98, 140], hipR: [106, 140], knR: [132, 168], anR: [124, 204], knL: [82, 174], anL: [58, 192],
    toeR: [10, 2], toeL: [8, -4], far: 'L',
  };

  // Holding a bowl at chest height and stirring (used on the Chef's Special card)
  POSES.stir = {
    head: [100, 60], neck: [100, 75], shL: [86, 86], shR: [114, 86], elL: [80, 112], haL: [91, 101], elR: [122, 110], haR: [108, 93],
    hipL: [92, 150], hipR: [108, 150], knL: [94, 192], knR: [108, 190], anL: [92, 234], anR: [110, 234], toeL: [-4, 6], toeR: [4, 6], far: 'L',
    noFace: true, // the Chef's Special art draws its own smiling face
  };

  // Chef's Special card art: The Chef in a chef's hat, stirring a steaming bowl
  F.V.chefSpecialArt = ch => {
    const fig = player(POSES.stir, ch, false);
    const r = (a => () => (a = (a * 16807) % 2147483647) / 2147483647)(30);
    let lights = '';
    const cols = ['#ffd27a', '#ff9a5a', '#ffffff'];
    for (let i = 0; i < 16; i++) lights += `<circle cx="${(10 + r() * 180).toFixed(0)}" cy="${(14 + r() * 80).toFixed(0)}" r="${(2 + r() * 5).toFixed(1)}" fill="${cols[i % 3]}" opacity="${(0.15 + r() * 0.3).toFixed(2)}"/>`;
    return `<svg viewBox="11 10 178 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="csBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a22"/><stop offset="1" stop-color="#140d0a"/></linearGradient>
        <linearGradient id="csSpot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6dc" stop-opacity=".35"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></linearGradient>
        <radialGradient id="csSoup" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffb35c"/><stop offset="1" stop-color="#c4561c"/></radialGradient>
        <linearGradient id="csBowl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6fb"/><stop offset="1" stop-color="#9aa3b5"/></linearGradient>
        <filter id="csBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
        <filter id="csSteam" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".8"/></filter>
      </defs>
      <rect x="0" y="0" width="200" height="160" fill="url(#csBg)"/>
      <g filter="url(#csBlur)">${lights}</g>
      <path d="M70 0 L130 0 L170 160 L30 160 Z" fill="url(#csSpot)"/>
      ${fig}
      <!-- Face: smiling while he cooks -->
      <g>
        <circle cx="88.5" cy="61" r="2.6" fill="${ch.colors.skin}"/><circle cx="111.5" cy="61" r="2.6" fill="${ch.colors.skin}"/>
        <path d="M91.5 55.5 L97 54.5 M103 54.5 L108.5 55.5" stroke="${ch.colors.hair}" stroke-width="1.4" stroke-linecap="round"/>
        <ellipse cx="95" cy="59" rx="1.6" ry="1.1" fill="#140c08"/><ellipse cx="105" cy="59" rx="1.6" ry="1.1" fill="#140c08"/>
        <path d="M100 60 Q98.6 64 100 65.4 Q101.6 65.8 102.6 65" stroke="${ch.colors.skinDark}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <path d="M95.5 68.5 Q100 72.2 104.5 68.5" stroke="#3a1e14" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      </g>
      <!-- Chef's hat (toque) -->
      <g>
        <circle cx="88" cy="32" r="10" fill="#f6f7fb"/>
        <circle cx="100" cy="26" r="12" fill="#ffffff"/>
        <circle cx="112" cy="32" r="10" fill="#f6f7fb"/>
        <rect x="86" y="32" width="28" height="14" fill="#ffffff"/>
        <path d="M94 34 V44 M100 30 V44 M106 34 V44" stroke="#dfe3ec" stroke-width="1"/>
        <rect x="85" y="43" width="30" height="7" rx="2" fill="#eef0f5" stroke="#cfd5e2" stroke-width=".8"/>
      </g>
      <!-- Bowl of food -->
      <path d="M80 100 Q100 124 120 100 Z" fill="url(#csBowl)"/>
      <ellipse cx="100" cy="100" rx="20" ry="5" fill="url(#csSoup)" stroke="#e8ecf4" stroke-width="1.6"/>
      <circle cx="93" cy="99" r="1.6" fill="#3fcb7e"/><circle cx="104" cy="101" r="1.4" fill="#e5484d"/><circle cx="109" cy="98.5" r="1.3" fill="#3fcb7e"/><circle cx="97" cy="102" r="1.2" fill="#ffe08a"/>
      <!-- Wooden spoon stirring -->
      <path d="M109 92 L99 101" stroke="#b47a3c" stroke-width="2.6" stroke-linecap="round"/>
      <ellipse cx="98" cy="101.5" rx="3" ry="1.6" fill="#a46b33"/>
      <circle cx="108" cy="93" r="4" fill="${ch.colors.skin}"/>
      <!-- Steam -->
      <g filter="url(#csSteam)" stroke="#ffffff" stroke-opacity=".7" stroke-width="1.6" fill="none" stroke-linecap="round">
        <path d="M84 96 q-3 -5 0 -9 q3 -4 0 -8"/>
        <path d="M92 95 q-3 -5 0 -9"/>
        <path d="M116 96 q-3 -5 0 -9 q3 -4 0 -8"/>
      </g>
    </svg>`;
  };

  // Coast to Coast card art: The King dribbling from one basket to the other
  // Shared with js/ui/card-art.js (card artwork uses the same players and poses)
  F.V.drawPlayer = player;
  F.V.POSES = POSES;

  F.V.coastToCoastArt = ch => {
    const fig = player(POSES.run, ch, false);
    const hoop = flip => `<g transform="${flip ? 'translate(160 0) scale(-1 1)' : ''}">
        <rect x="4" y="30" width="3" height="40" fill="#3a4058"/>
        <rect x="6" y="32" width="10" height="2.5" fill="#3a4058"/>
        <rect x="15" y="24" width="3" height="20" rx="1" fill="#e9edf5"/>
        <path d="M18 39 H30" stroke="#F26A1B" stroke-width="2" stroke-linecap="round"/>
        <path d="M19 40 L22 49 M24 40 V50 M29 40 L26 49" stroke="#f4f4f2" stroke-width=".8"/>
      </g>`;
    return `<svg viewBox="0 0 160 126" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ccSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3150"/><stop offset="1" stop-color="#11152a"/></linearGradient>
        <linearGradient id="ccFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a32"/><stop offset="1" stop-color="#c58e58"/></linearGradient>
        <filter id="ccBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>
        <filter id="ccLights" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5"/></filter>
      </defs>
      <rect width="160" height="126" fill="url(#ccSky)"/>
      <g filter="url(#ccLights)" opacity=".5">${crowd(73, 22).replace(/cy="(\d+)"/g, (m, y) => `cy="${(+y / 9).toFixed(0)}"`).replace(/cx="(\d+)"/g, (m, x) => `cx="${(+x / 10).toFixed(0)}"`).replace(/r="([\d.]+)"/g, (m, r) => `r="${(+r / 4).toFixed(1)}"`)}</g>
      <path d="M0 66 H160 V126 H0 Z" fill="url(#ccFloor)"/>
      <path d="M0 74 H160 M0 86 H160 M0 100 H160" stroke="rgba(60,30,10,.3)" stroke-width=".6"/>
      <path d="M80 66 L76 126" stroke="#fff" stroke-opacity=".7" stroke-width="1.4"/>
      <ellipse cx="78" cy="88" rx="22" ry="7" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/>
      ${hoop(false)}${hoop(true)}
      <path d="M22 82 Q50 86 70 84" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.1" stroke-dasharray="2 3"/>
      <path d="M124 84 Q132 82 138 76" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.1" stroke-dasharray="2 3"/>
      <path d="M134 74 l5 2 l-2 4" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.1"/>
      <g stroke="#fff3d6" stroke-opacity=".6" stroke-linecap="round">
        <path d="M34 34 H64" stroke-width="1.4"/><path d="M26 46 H60" stroke-width="1"/><path d="M38 58 H66" stroke-width="1.2"/>
      </g>
      <g filter="url(#ccBlur)">
        <g opacity=".14" transform="translate(4 -12) scale(.5)">${fig}</g>
        <g opacity=".28" transform="translate(24 -12) scale(.5)">${fig}</g>
      </g>
      <ellipse cx="96" cy="91" rx="22" ry="3" fill="#000" opacity=".35"/>
      <g transform="translate(44 -12) scale(.5)">${fig}</g>
    </svg>`;
  };

  // Crowd lights (same pattern every time)
  function crowd(seed, n) {
    let r = seed;
    const rand = () => (r = (r * 16807) % 2147483647) / 2147483647;
    const cols = ['#ffd27a', '#ff9a5a', '#a9c3ff', '#ffffff'];
    let s = '';
    for (let i = 0; i < n; i++) {
      s += `<circle cx="${(rand() * 1600).toFixed(0)}" cy="${(30 + rand() * 560).toFixed(0)}" r="${(4 + rand() * 14).toFixed(1)}" fill="${cols[i % 4]}" opacity="${(0.08 + rand() * 0.22).toFixed(2)}"/>`;
    }
    return s;
  }

  // ---------------- Home screen players: "Arena Hero" ----------------
  // Real body shapes (tapered, muscled limbs, tank-top jersey, fitted shorts,
  // wristbands, sneakers), each part shaded from the spotlight above.
  // The card art keeps using player() above.
  const vadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const vsub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const vmul = (a, k) => [a[0] * k, a[1] * k];
  const vmix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const vnorm = a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
  const pt = p => `${+p[0].toFixed(1)} ${+p[1].toFixed(1)}`;

  // Tapered limb: rounded ends, radius ra at a, rb at b, bulging to rm (muscle) at t along the way
  function limb(a, b, ra, rb, rm = (ra + rb) / 2, t = 0.45) {
    const d = vnorm(vsub(b, a)), n = [-d[1], d[0]];
    const m = vmix(a, b, t), k = 2 * rm - (ra + rb) / 2;
    const p1 = vadd(a, vmul(n, ra)), p2 = vadd(b, vmul(n, rb)), p3 = vadd(b, vmul(n, -rb)), p4 = vadd(a, vmul(n, -ra));
    return { d: `M${pt(p1)} Q${pt(vadd(m, vmul(n, k)))} ${pt(p2)} A${rb} ${rb} 0 0 0 ${pt(p3)} Q${pt(vadd(m, vmul(n, -k)))} ${pt(p4)} A${ra} ${ra} 0 0 0 ${pt(p1)}Z`, mid: m, n, r: Math.max(ra, rm) };
  }
  const blob = (c, r) => ({ d: `M${pt([c[0] - r, c[1]])} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0Z`, mid: c, n: [0, 1], r });

  // Body parts in drawing order (back to front)
  function heroParts(P) {
    const near = P.far === 'L' ? 'R' : 'L', far = P.far;
    const list = [];
    const push = (shape, role) => list.push({ ...shape, role });
    const arm = s => {
      const sh = P['sh' + s], el = P['el' + s], ha = P['ha' + s];
      push(limb(sh, el, 6.6, 5, 7.8, 0.4), 'skin');
      push(limb(el, ha, 5, 3.8, 5.6, 0.35), 'skin');
      push(limb(vmix(el, ha, 0.7), vmix(el, ha, 0.88), 4.7, 4.4), 'trim');
      push(blob(ha, 5.3), 'skin');
    };
    const shoe = (an, toe) => {
      const dir = vnorm(toe), tip = vadd(an, vmul(dir, 14)), heel = vadd(an, vmul(dir, -3));
      let n = [-dir[1], dir[0]]; if (n[1] < 0) n = vmul(n, -1);
      push(limb(heel, tip, 5.8, 4.6, 6, 0.4), 'shoe');
      push(limb(vadd(heel, vmul(n, 4.2)), vadd(tip, vmul(n, 3.4)), 2.1, 1.8), 'sole');
    };
    const leg = s => {
      const hip = P['hip' + s], kn = P['kn' + s], an = P['an' + s];
      push(limb(hip, kn, 9, 6.6, 9.8, 0.4), 'skin');
      push(limb(kn, an, 6.4, 4, 7.6, 0.28), 'skin');
      push(limb(vmix(kn, an, 0.72), an, 5, 4.5), 'sock');
      shoe(an, P['toe' + s]);
    };
    // Fitted shorts leg: hugs the thigh with gently curved sides and a flat hem
    const shortsLeg = s => {
      const hip = P['hip' + s], bot = vmix(hip, P['kn' + s], 0.62);
      const d = vnorm(vsub(bot, hip)), n = [-d[1], d[0]];
      const r1 = 10.4, r2 = 10.6, m = vmix(hip, bot, 0.5), bulge = 11.4;
      push({ d: `M${pt(vadd(hip, vmul(n, r1)))} Q${pt(vadd(m, vmul(n, bulge)))} ${pt(vadd(bot, vmul(n, r2)))} L${pt(vadd(bot, vmul(n, -r2)))} Q${pt(vadd(m, vmul(n, -bulge)))} ${pt(vadd(hip, vmul(n, -r1)))}Z`, mid: m, n, r: r2 }, 'shorts');
      const h = vadd(bot, vmul(d, -3));
      push(limb(vadd(h, vmul(n, r2 - 0.4)), vadd(h, vmul(n, -(r2 - 0.4))), 1.3, 1.3), 'trim');
    };

    arm(far);
    push(limb(P.neck, P.head, 5.6, 5.6), 'skin');
    leg(far); leg(near);
    shortsLeg(far);
    // Waistband: same width as the bottom of the jersey
    const hd = vnorm(vsub(P.hipR, P.hipL));
    const wb = [vadd(P.hipL, vadd(vmul(hd, -8.5), [0, -6])), vadd(P.hipR, vadd(vmul(hd, 8.5), [0, -6])), vadd(P.hipR, vadd(vmul(hd, 7), [0, 8])), vadd(P.hipL, vadd(vmul(hd, -7), [0, 8]))];
    push({ d: 'M' + wb.map(pt).join(' L') + 'Z', mid: vmix(wb[0], wb[2], 0.5), n: [1, 0], r: 13 }, 'shorts');
    shortsLeg(near);

    // Jersey: tank top with a scoop neck and armholes
    const shC = vmix(P.shL, P.shR, 0.5), hipC = vmix(P.hipL, P.hipR, 0.5);
    const tc = vmix(shC, hipC, 0.5), down = vnorm(vsub(hipC, shC));
    const side = vnorm(vsub(P.shR, P.shL));
    const A = vadd(vmix(P.shL, P.shR, 0.22), vmul(down, -2)), B = vadd(vmix(P.shL, P.shR, 0.78), vmul(down, -2));
    const sL = vadd(P.shL, vadd(vmul(side, -3), vmul(down, -2))), sR = vadd(P.shR, vadd(vmul(side, 3), vmul(down, -2)));
    const pitL = vadd(P.shL, vadd(vmul(side, -1), vmul(down, 18))), pitR = vadd(P.shR, vadd(vmul(side, 1), vmul(down, 18)));
    const armL = vadd(vmix(sL, pitL, 0.5), vmul(side, 6)), armR = vadd(vmix(sR, pitR, 0.5), vmul(side, -6));
    const hL = vadd(vadd(P.hipL, vmul(side, -8)), vmul(down, 4)), hR = vadd(vadd(P.hipR, vmul(side, 8)), vmul(down, 4));
    const nk = vadd(P.neck, vmul(down, 11));
    list.push({ role: 'torso', d: `M${pt(A)} Q${pt(nk)} ${pt(B)} L${pt(sR)} Q${pt(armR)} ${pt(pitR)} L${pt(hR)} L${pt(hL)} L${pt(pitL)} Q${pt(armL)} ${pt(sL)}Z`, a: sL, b: sR });
    list.push({ role: 'line', d: `M${pt(A)} Q${pt(nk)} ${pt(B)} M${pt(sR)} Q${pt(armR)} ${pt(pitR)} M${pt(sL)} Q${pt(armL)} ${pt(pitL)}` });
    list.push({ role: 'number', at: vadd(tc, vmul(down, 5)) });
    list.push({ role: 'head', at: P.head });
    arm(near);
    return list;
  }

  // Draw one Arena Hero player. defs collects the shading gradients (ids start with idp).
  // ball = draw the ball in the hands (false for a player who has just shot)
  function heroPlayer(P, ch, flip, defs, idp, ball = true) {
    const c = ch.colors;
    let n = 0;
    // Per-limb shading: light on the side facing up, dark underneath
    const shade = (part, cols) => {
      const id = `${idp}${n++}`;
      let nn = part.n; if (nn[1] > 0) nn = vmul(nn, -1);
      const a = vadd(part.mid, vmul(nn, part.r)), b = vadd(part.mid, vmul(nn, -part.r));
      defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"><stop offset="0" stop-color="${cols[0]}"/><stop offset=".45" stop-color="${cols[1]}"/><stop offset="1" stop-color="${cols[2]}"/></linearGradient>`);
      return `url(#${id})`;
    };
    const paint = p => {
      switch (p.role) {
        case 'skin': return `fill="${shade(p, [c.skinLight, c.skin, c.skinDark])}"`;
        case 'shorts': return `fill="${shade(p, [c.jerseyLight, c.jersey, c.jerseyDark])}"`;
        case 'shoe': return `fill="${shade(p, ['#ffffff', '#e6e8ee', '#9aa0ae'])}"`;
        case 'sock': return `fill="${shade(p, ['#ffffff', '#eceef3', '#b4b8c4'])}"`;
        case 'sole': return `fill="${c.jerseyDark}"`;
        case 'trim': return `fill="${c.trim}"`;
        case 'line': return `fill="none" stroke="${c.trim}" stroke-width="2.6" stroke-linecap="round"`;
        case 'torso': {
          const id = `${idp}${n++}`;
          defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${p.a[0]}" y1="${p.a[1] - 10}" x2="${p.b[0]}" y2="${p.b[1] + 30}"><stop offset="0" stop-color="${c.jerseyLight}"/><stop offset=".5" stop-color="${c.jersey}"/><stop offset="1" stop-color="${c.jerseyDark}"/></linearGradient>`);
          return `fill="url(#${id})"`;
        }
      }
      return '';
    };
    const out = heroParts(P).map(p => {
      if (p.role === 'number') {
        const [x, y] = p.at;
        return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="18" fill="${c.trim}" ${flip ? `transform="translate(${(2 * x).toFixed(1)} 0) scale(-1 1)"` : ''}>${ch.number}</text>`;
      }
      if (p.role === 'head') {
        const id = `${idp}${n++}`;
        defs.push(`<radialGradient id="${id}" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${c.skinLight}"/><stop offset=".55" stop-color="${c.skin}"/><stop offset="1" stop-color="${c.skinDark}"/></radialGradient>`);
        const skin = `url(#${id})`;
        return `<g transform="translate(${p.at[0]} ${p.at[1]})">
          <ellipse cx="-11.6" cy="1" rx="2.4" ry="3.4" fill="${skin}"/><ellipse cx="11.6" cy="1" rx="2.4" ry="3.4" fill="${skin}"/>
          <ellipse cx="0" cy=".6" rx="11.8" ry="12.8" fill="${skin}"/>
          <path d="M-11.9 -1 A11.9 12.4 0 0 1 11.9 -1 Q6 -6.5 0 -6.8 Q-6 -6.5 -11.9 -1Z" fill="${c.hair}"/>
          ${c.headband ? '<path d="M-11.9 -3.2 Q0 -10.5 11.9 -3.2" stroke="#f4f4f2" stroke-width="3.6" fill="none"/>' : ''}
          <path d="M-7 -3 L-2.5 -3.8 M2.5 -3.8 L7 -3" stroke="${c.hair}" stroke-width="1.4" stroke-linecap="round"/>
          <ellipse cx="-4.5" cy="-.4" rx="2" ry="1.3" fill="#fff" opacity=".9"/><ellipse cx="4.5" cy="-.4" rx="2" ry="1.3" fill="#fff" opacity=".9"/>
          <circle cx="-4.2" cy="-.4" r="1.1" fill="#140c08"/><circle cx="4.8" cy="-.4" r="1.1" fill="#140c08"/>
          <path d="M0 .5 Q-1.4 3.8 0 4.6 Q1.4 4.8 2.2 4" stroke="${c.skinDark}" stroke-width="1" fill="none" stroke-linecap="round"/>
          ${c.beard ? `<path d="M-10.5 1 Q-9.5 11.5 0 13.5 Q9.5 11.5 10.5 1 Q7 8 0 8.6 Q-7 8 -10.5 1Z" fill="${c.hair}"/>` : ''}
          <path d="M-3.6 7 Q0 9.4 3.6 7" stroke="${c.beard ? '#f2e3d0' : '#3a1e14'}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        </g>`;
      }
      return `<path d="${p.d}" ${paint(p)}/>`;
    }).join('');
    return out + (ball && P.ball ? basketball(P.ball[0], P.ball[1], 11) : '');
  }

  // Ball flying from The Chef's hands into the right basket, on a loop
  const shotArc = () => `<g opacity="0">
      <animateMotion dur="2.6s" repeatCount="indefinite" path="M1150 330 Q1320 60 1466 300" keyPoints="0;1;1" keyTimes="0;.62;1" calcMode="linear"/>
      <animate attributeName="opacity" dur="2.6s" repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;.06;.58;.66;1"/>
      ${basketball(0, 0, 20)}
    </g>`;

  F.V.homeBackground = () => {
    const defs = [];
    const king = heroPlayer(POSES.dunk, F.CHARACTERS.king, true, defs, 'hbk');
    const chef = heroPlayer(POSES.shot, F.CHARACTERS.chef, false, defs, 'hbc', false);
    return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="hbBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262c48"/><stop offset=".8" stop-color="#0b0e1b"/></linearGradient>
        <linearGradient id="hbSpot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6dc" stop-opacity=".32"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></linearGradient>
        <linearGradient id="hbFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e4423"/><stop offset=".5" stop-color="#a87444"/><stop offset="1" stop-color="#c58e58"/></linearGradient>
        <radialGradient id="hbVig" cx=".5" cy=".47" r=".31"><stop offset="0" stop-color="#05070d" stop-opacity=".82"/><stop offset=".7" stop-color="#05070d" stop-opacity=".45"/><stop offset="1" stop-color="#05070d" stop-opacity="0"/></radialGradient>
        <filter id="hbBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>
        <filter id="hbRim" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="-1.6" dy="-1" stdDeviation=".5" flood-color="#fff1d6" flood-opacity=".8"/></filter>
        <filter id="hbTrail" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
        ${defs.join('')}
      </defs>
      <rect width="1600" height="900" fill="url(#hbBg)"/>
      <g filter="url(#hbBlur)">
        <g class="hb-twinkle">${crowd(17, 60)}</g>
        <g class="hb-twinkle late">${crowd(41, 60)}</g>
      </g>
      <rect y="760" width="1600" height="140" fill="url(#hbFloor)"/>
      <path d="M0 790 H1600 M0 830 H1600 M0 870 H1600" stroke="rgba(60,30,10,.35)" stroke-width="1.5"/>
      <path d="M560 900 Q800 780 1040 900" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none"/>
      <g stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none">
        <path d="M0 772 H132 A280 34 0 0 1 132 840 H0"/>
        <path d="M1600 772 H1468 A280 34 0 0 0 1468 840 H1600"/>
      </g>
      <g class="hb-sweep" style="transform-origin:250px -40px"><path d="M140 -40 L360 -40 L560 900 L-80 900 Z" fill="url(#hbSpot)"/></g>
      <g class="hb-sweep late" style="transform-origin:1140px -40px"><path d="M1040 -40 L1240 -40 L1440 900 L840 900 Z" fill="url(#hbSpot)"/></g>
      <ellipse cx="250" cy="806" rx="120" ry="12" fill="#000" opacity=".35"/>
      <g class="hb-shadow"><ellipse cx="1140" cy="806" rx="80" ry="10" fill="#000" opacity=".45"/></g>
      ${hoop()}
      <g transform="translate(1600 0) scale(-1 1)">${hoop()}</g>
      <g class="hb-twinkle" stroke="#fff3d6" stroke-width="4" stroke-linecap="round" opacity=".55">
        <path d="M440 560 L540 620 M460 505 L570 562 M485 450 L565 488"/>
      </g>
      <g filter="url(#hbTrail)">
        <g opacity=".14">${place(king, 455, 368, 1.85, true)}</g>
        <g opacity=".26">${place(king, 420, 308, 1.85, true)}</g>
      </g>
      <g filter="url(#hbRim)">
        <g class="hb-hang">${place(king, 385, 248, 1.85, true)}</g>
        <g class="hb-float late">${place(chef, 955, 300, 1.85, false)}</g>
      </g>
      ${shotArc()}
      <g class="hb-twinkle late" stroke="#fff3d6" stroke-width="3" stroke-linecap="round" opacity=".4">
        <path d="M1105 760 L1105 785 M1140 765 L1140 795 M1175 760 L1175 785"/>
      </g>
      <rect width="1600" height="900" fill="url(#hbVig)"/>
    </svg>`;
  };
})(FCD);
