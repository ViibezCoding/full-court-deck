// Rookie Card player art: "Arena Spotlight" style.
// A shaded player dribbling under a spotlight, crowd lights behind,
// hardwood floor below. Colors come from each character's `colors`
// in js/data/characters.js.
(function (F) {
  let uid = 0;

  // Small repeatable random numbers, so each star's crowd looks the same every time
  function rng(seed) {
    return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  }

  function figure(p, ch) {
    const c = ch.colors;
    const sk = `url(#${p}sk)`;
    const parts = [];
    // Legs, socks, shoes
    parts.push(`<path d="M64 224 L92 224 Q93 240 89 252 Q86 262 85 272 L73 272 Q71 260 68 250 Q63 238 64 224 Z" fill="${sk}"/>`);
    parts.push(`<path d="M108 224 L136 224 Q137 238 132 250 Q129 262 127 272 L115 272 Q114 260 111 250 Q107 240 108 224 Z" fill="${sk}"/>`);
    parts.push('<path d="M73 266 L85 266 L85 280 L73 280 Z M115 266 L127 266 L127 280 L115 280 Z" fill="#f4f4f2"/>');
    parts.push(`<path d="M70 278 L88 278 Q93 283 93 289 L61 289 Q60 283 70 278 Z M112 278 L130 278 Q140 283 141 289 L109 289 Q108 283 112 278 Z" fill="${c.jerseyDark}"/>`);
    parts.push('<path d="M61 286 L93 286 L93 290 L61 290 Z M109 286 L141 286 L141 290 L109 290 Z" fill="#f4f4f2"/>');
    parts.push(`<path d="M72 281 L86 281 M114 281 L128 281" stroke="${c.trim}" stroke-width="2"/>`);
    // Shorts
    parts.push(`<path d="M69 162 L131 162 L140 226 Q122 230 106 226 L100 196 L94 226 Q78 230 60 226 Z" fill="url(#${p}jr)"/>`);
    parts.push(`<path d="M69 162 L131 162 L131.6 170 L68.4 170 Z" fill="${c.jerseyDark}"/>`);
    parts.push(`<path d="M66 176 L60.5 224 M134 176 L139.5 224" stroke="${c.trim}" stroke-width="4"/>`);
    parts.push('<path d="M82 186 Q86 204 80 222 M118 186 Q114 204 121 222" stroke="rgba(0,0,0,.25)" stroke-width="1.5" fill="none"/>');
    // Left arm (relaxed)
    parts.push(`<path d="M74 80 Q62 80 59 94 L54 132 Q58 138 66 136 L71 104 Q76 92 76 84 Z" fill="${sk}"/>`);
    parts.push(`<path d="M54 132 Q50 152 51 176 L61 178 Q63 154 66 136 Z" fill="${sk}"/>`);
    parts.push(`<path d="M50 174 Q48 186 52 192 Q58 196 62 190 Q63 182 61 176 Z" fill="${sk}"/>`);
    // Right arm (dribbling)
    parts.push(`<path d="M126 80 Q138 80 142 94 L150 126 Q146 134 138 132 L130 104 Q125 92 124 84 Z" fill="${sk}"/>`);
    parts.push(`<path d="M150 126 Q158 146 164 164 L154 170 Q146 152 138 132 Z" fill="${sk}"/>`);
    // Neck, shoulders, jersey
    parts.push(`<path d="M93 50 L107 50 L109 70 L91 70 Z" fill="${sk}"/>`);
    parts.push(`<path d="M68 84 Q74 70 91 66 L109 66 Q126 70 132 84 Q132 90 128 92 L72 92 Q68 90 68 84 Z" fill="${sk}"/>`);
    parts.push(`<path d="M76 80 Q86 82 90 68 L100 86 L110 68 Q114 82 124 80 L128 84 Q123 100 127 120 L131 166 Q100 172 69 166 L73 120 Q77 100 72 84 Z" fill="url(#${p}jr)"/>`);
    parts.push(`<path d="M90 68 L100 86 L110 68" stroke="${c.trim}" stroke-width="3" fill="none" stroke-linejoin="round"/>`);
    parts.push(`<path d="M72 84 Q77 100 73 120 M128 84 Q123 100 127 120" stroke="${c.trim}" stroke-width="2.5" fill="none"/>`);
    parts.push(`<text x="100" y="106" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="8.5" letter-spacing="1" fill="${c.trim}">${ch.teamShort}</text>`);
    parts.push(`<text x="100" y="140" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="30" fill="${c.trim}" stroke="${c.jerseyDark}" stroke-width="1">${ch.number}</text>`);
    parts.push('<path d="M80 150 Q90 146 94 162 M114 146 Q108 156 118 165" stroke="rgba(0,0,0,.28)" stroke-width="1.6" fill="none"/>');
    // Head and face
    parts.push(`<ellipse cx="87" cy="38" rx="2.8" ry="5" fill="${sk}"/><ellipse cx="113" cy="38" rx="2.8" ry="5" fill="${sk}"/>`);
    parts.push(`<path d="M87 36 Q87 20 100 19 Q113 20 113 36 Q113 48 106 54 Q100 58 94 54 Q87 48 87 36 Z" fill="${sk}"/>`);
    parts.push(`<path d="M87 33 Q86 17.5 100 17 Q114 17.5 113 33 Q110 24 100 23.5 Q90 24 87 33 Z" fill="${c.hair}"/>`);
    if (!c.headband) for (let i = 0; i < 9; i++) parts.push(`<circle cx="${89 + i * 2.75}" cy="${20 + Math.abs(4 - i) * 0.9}" r="2.2" fill="${c.hair}"/>`);
    if (c.headband) parts.push('<path d="M86.6 28.5 Q100 23.5 113.4 28.5 L113.4 32.5 Q100 27.5 86.6 32.5 Z" fill="#f4f4f2"/>');
    if (c.beard) {
      parts.push(`<path d="M88 41 Q89.5 53 100 58.5 Q110.5 53 112 41 Q110 49.5 106 51.5 Q100 54.5 94 51.5 Q90 49.5 88 41 Z" fill="${c.hair}" opacity=".9"/>`);
      parts.push(`<path d="M95 47.6 Q100 46 105 47.6" stroke="${c.hair}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
    }
    parts.push(`<path d="M91.5 33.2 L97 32.2 M103 32.2 L108.5 33.2" stroke="${c.hair}" stroke-width="1.6" stroke-linecap="round"/>`);
    parts.push('<ellipse cx="94.6" cy="37.2" rx="1.8" ry="1.2" fill="#140c08"/><ellipse cx="105.4" cy="37.2" rx="1.8" ry="1.2" fill="#140c08"/>');
    parts.push(`<path d="M100 38 Q98.2 43.5 99.6 45.4 Q101.6 45.8 103 44.8" stroke="${c.skinDark}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`);
    parts.push('<path d="M96.4 50 Q100 51.6 103.6 50" stroke="#3a1e14" stroke-width="1.3" fill="none" stroke-linecap="round"/>');
    // Ball and dribbling hand
    parts.push(`<circle cx="164" cy="199" r="15" fill="url(#${p}ball)"/>`);
    parts.push('<path d="M149 199 H179 M164 184 V214 M153 189 Q161 199 153 209 M175 189 Q167 199 175 209" stroke="#3a1606" stroke-width="1.1" fill="none"/>');
    parts.push(`<path d="M152 166 Q156 176 166 178 Q172 176 170 168 Q166 160 162 162 Z" fill="${sk}"/>`);
    return parts.join('');
  }

  // Small head-and-shoulders portrait (used in the top bar during a season)
  F.V.playerPortrait = ch => (ch.image
    ? `<img src="${F.U.esc(ch.image)}" alt="">`
    : F.V.playerArt(ch, { viewBox: '68 10 64 64' }));

  F.V.playerArt = (ch, opts = {}) => {
    const c = ch.colors;
    const p = `pa${uid++}_`;
    const r = rng(ch.number * 97);
    const lights = ['#ffd27a', '#ff9a5a', '#a9c3ff', '#ffffff'];
    let bokeh = '';
    for (let i = 0; i < 46; i++) {
      bokeh += `<circle cx="${(-50 + r() * 300).toFixed(1)}" cy="${(10 + r() * 165).toFixed(1)}" r="${(2.5 + r() * 7).toFixed(1)}" fill="${lights[i % 4]}" opacity="${(0.12 + r() * 0.3).toFixed(2)}"/>`;
    }
    return `<svg viewBox="${opts.viewBox || '0 0 200 300'}" preserveAspectRatio="xMidYMid ${opts.viewBox ? 'slice' : 'meet'}" aria-hidden="true">
      <defs>
        <linearGradient id="${p}sk" x1="0" x2="1"><stop offset="0" stop-color="${c.skin}"/><stop offset="1" stop-color="${c.skin}"/></linearGradient>
        <linearGradient id="${p}jr" x1="0" x2="1"><stop offset="0" stop-color="${c.jerseyLight}"/><stop offset=".55" stop-color="${c.jersey}"/><stop offset="1" stop-color="${c.jerseyDark}"/></linearGradient>
        <radialGradient id="${p}ball" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f6a060"/><stop offset=".6" stop-color="#d4621f"/><stop offset="1" stop-color="#6e2a0c"/></radialGradient>
        <linearGradient id="${p}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3150"/><stop offset=".75" stop-color="#0c0f1d"/></linearGradient>
        <linearGradient id="${p}fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4c28"/><stop offset=".4" stop-color="#b9814b"/><stop offset="1" stop-color="#d49a60"/></linearGradient>
        <linearGradient id="${p}sp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6dc" stop-opacity=".38"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></linearGradient>
        <filter id="${p}blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
        <filter id="${p}rim" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="-1.3" dy="-.6" stdDeviation=".35" flood-color="#fff1d6" flood-opacity=".75"/></filter>
      </defs>
      <rect x="-80" y="0" width="360" height="300" fill="url(#${p}bg)"/>
      <g filter="url(#${p}blur)">${bokeh}</g>
      <path d="M-80 232 L280 232 L280 300 L-80 300 Z" fill="url(#${p}fl)"/>
      <path d="M-80 246 L280 246 M-80 262 L280 262 M-80 280 L280 280" stroke="rgba(60,30,10,.35)" stroke-width=".8"/>
      <path d="M-20 300 Q100 238 220 300" stroke="rgba(255,255,255,.55)" stroke-width="2" fill="none"/>
      <path d="M70 -10 L130 -10 L210 300 L-10 300 Z" fill="url(#${p}sp)"/>
      <ellipse cx="102" cy="290" rx="54" ry="6" fill="rgba(0,0,0,.45)"/>
      <g filter="url(#${p}rim)">${figure(p, ch)}</g>
    </svg>`;
  };
})(FCD);
