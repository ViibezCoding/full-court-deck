// Season map background: a full basketball court seen from above.
//   Regular season (Nov-Apr): Classic Hardwood
//   Playoffs (May) and Finals (June): Prime-Time Arena lighting
// Black lettering runs along both sidelines with the phase name.
(function (F) {
  const W = 600, H = 800;

  // Repeatable random numbers so the court looks the same every time
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // Maple planks running top to bottom, with wood grain
  function wood(tones, grainOpacity, stain) {
    let planks = '';
    for (let i = 0; i < 6; i++) planks += `<rect x="${i * 20}" y="0" width="20" height="${H}" fill="${tones[i % tones.length]}"/>`;
    const r = rng(7);
    let joints = '';
    for (let i = 0; i < 6; i++) for (let k = 0; k < 3; k++) joints += `<path d="M${i * 20} ${(r() * H).toFixed(0)} h20" stroke="rgba(0,0,0,.18)" stroke-width="1"/>`;
    return `<defs>
        <pattern id="ctPlank" width="120" height="${H}" patternUnits="userSpaceOnUse">${planks}${joints}<path d="M0 0V${H}M20 0V${H}M40 0V${H}M60 0V${H}M80 0V${H}M100 0V${H}" stroke="rgba(0,0,0,.2)" stroke-width="1"/></pattern>
        <filter id="ctGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.3 0.006" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .25  0 0 0 0 .14  0 0 0 0 .06  0 0 0 ${grainOpacity} 0"/></filter>
        <linearGradient id="ctGloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#ctPlank)"/>
      <rect width="${W}" height="${H}" filter="url(#ctGrain)"/>
      ${stain ? `<rect width="${W}" height="${H}" fill="${stain}"/>` : ''}
      <rect width="${W}" height="${H}" fill="url(#ctGloss)"/>`;
  }

  // Boundary, half court, center circle, keys, free-throw circles, 3-point arcs, rims.
  // The 3-point arcs peak at y 300 / 500: halfway between the free-throw circles and the center circle.
  function lines(col, w, paint, paintOpacity) {
    const end = top => {
      const ky = top ? 30 : 590, ft = top ? 210 : 590;
      return `<rect x="220" y="${ky}" width="160" height="180" fill="${paint}" fill-opacity="${paintOpacity}" stroke="${col}" stroke-width="${w}"/>
        <path d="M240 ${ft} A60 60 0 0 ${top ? 0 : 1} 360 ${ft}" fill="none" stroke="${col}" stroke-width="${w}"/>
        <path d="M240 ${ft} A60 60 0 0 ${top ? 1 : 0} 360 ${ft}" fill="none" stroke="${col}" stroke-width="${w}" stroke-dasharray="10 10"/>
        <path d="M62 ${top ? 30 : 770} V${top ? 91 : 709} A240 240 0 0 ${top ? 0 : 1} 538 ${top ? 91 : 709} V${top ? 30 : 770}" fill="none" stroke="${col}" stroke-width="${w}"/>
        <path d="M265 ${top ? 72 : 728} H335" stroke="${col}" stroke-width="${w * 1.5}"/>
        <circle cx="300" cy="${top ? 88 : 712}" r="10" fill="none" stroke="${col}" stroke-width="${w}"/>
        <path d="M262 ${top ? 88 : 712} A38 38 0 0 ${top ? 0 : 1} 338 ${top ? 88 : 712}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
    };
    return `<rect x="30" y="30" width="540" height="740" fill="none" stroke="${col}" stroke-width="${w * 1.4}"/>
      <path d="M30 400 H570" stroke="${col}" stroke-width="${w}"/>
      <circle cx="300" cy="400" r="70" fill="${paint}" stroke="${col}" stroke-width="${w}"/>
      ${end(true)}${end(false)}`;
  }

  function centerLogo(main, accent, label) {
    return `<g transform="translate(300 400)">
      <circle r="48" fill="${main}" opacity=".9"/>
      <circle r="42" fill="none" stroke="${accent}" stroke-width="2.5"/>
      <text y="-4" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="26" fill="${accent}" font-style="italic">FCD</text>
      <text y="16" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="10" letter-spacing="2" fill="${accent}">${label}</text>
    </g>`;
  }

  // Regular-season center court: a player dunking on a rim, painted in cream and orange.
  // Scaled so the whole picture (backboard included) fits inside the center circle.
  function dunkLogo() {
    const c = '#fffaf0';
    const L = (a, b, w) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    const P = { head: [112, 68], neck: [107, 82], shL: [96, 88], shR: [116, 86], elR: [134, 58], haR: [146, 30], ball: [152, 20], elL: [84, 114], haL: [78, 140],
      hipL: [92, 152], hipR: [102, 150], knL: [116, 188], anL: [104, 222], knR: [86, 194], anR: [72, 226] };
    const body = L(P.shL, P.elL, 10) + L(P.elL, P.haL, 8) + L(P.hipL, P.knL, 15) + L(P.knL, P.anL, 11) + L(P.hipR, P.knR, 15) + L(P.knR, P.anR, 11)
      + `<path d="M${P.shL} L${P.shR} L${P.hipR} L${P.hipL} Z" fill="${c}" stroke="${c}" stroke-width="14" stroke-linejoin="round"/>`
      + L(P.neck, P.head, 9) + `<circle cx="${P.head[0]}" cy="${P.head[1]}" r="12" fill="${c}"/>` + L(P.shR, P.elR, 10) + L(P.elR, P.haR, 8);
    return `<g transform="translate(300 400) scale(.42) translate(-122 -105)">
        <rect x="198" y="0" width="8" height="56" rx="2" fill="${c}" opacity=".9"/>
        <path d="M150 34 H200" stroke="#F26A1B" stroke-width="7" stroke-linecap="round"/>
        <path d="M156 36 L164 70 M172 36 L174 72 M190 36 L184 70" stroke="${c}" stroke-width="3" opacity=".8"/>
        ${body}
        <circle cx="${P.ball[0]}" cy="${P.ball[1]}" r="13" fill="#F26A1B"/>
        <path d="M139 20 H165 M152 7 V33" stroke="#1d2a52" stroke-width="2"/>
        <path d="M40 120 L64 110 M34 150 L60 142 M44 180 L66 172" stroke="#F26A1B" stroke-width="5" stroke-linecap="round" opacity=".85"/>
      </g>`;
  }

  function trophyLogo(ring) {
    return `<g transform="translate(300 400)"><circle r="52" fill="#0e0f14"/><circle r="46" fill="none" stroke="${ring}" stroke-width="3"/></g>
      <g transform="translate(300 404) scale(1.7)" fill="#ffcf5a"><path d="M-14 -24h28v12a14 14 0 01-28 0z"/><path d="M-14 -20h-8c0 10 4 14 10 14M14 -20h8c0 10-4 14-10 14" stroke="#ffcf5a" stroke-width="3" fill="none"/><rect x="-3" y="2" width="6" height="10"/><rect x="-11" y="12" width="22" height="6" rx="1"/></g>`;
  }

  // Vertical lettering painted between the half court line and the 3-point line:
  // bottom-left reads bottom-to-top, top-right reads top-to-bottom
  function sideText(word, color, outline) {
    const style = `font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="25" letter-spacing="4" fill="${color}" text-anchor="middle" dominant-baseline="middle"${outline ? ` stroke="${outline}" stroke-width=".9" paint-order="stroke"` : ''}`;
    return `<text ${style} transform="translate(51 499) rotate(-90)">${word}</text>
      <text ${style} transform="translate(549 301) rotate(90)">${word}</text>`;
  }

  // Round "FULL COURT DECK" logo in the corners opposite the words, centered
  // halfway between the 3-point line and half court: top-left and bottom-right
  function cornerLogos(plate, border, text, accent) {
    const font = 'font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-style="italic" text-anchor="middle"';
    const logo = `<circle r="38" fill="${plate}" stroke="${border}" stroke-width="2.5"/>
      <circle r="32" fill="none" stroke="${border}" stroke-width="1" opacity=".6"/>
      <text y="-12" ${font} font-size="11" letter-spacing="2" fill="${text}">FULL</text>
      <text y="3" ${font} font-size="14" letter-spacing="1.5" fill="${text}">COURT</text>
      <text y="21" ${font} font-size="18" letter-spacing="1" fill="${accent}">DECK</text>`;
    return `<g transform="translate(105 334)">${logo}</g>
      <g transform="translate(495 466)">${logo}</g>`;
  }

  function arenaLights(seed, colors) {
    const r = rng(seed);
    let s = '';
    for (let i = 0; i < 26; i++) s += `<ellipse cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" rx="${(6 + r() * 16).toFixed(0)}" ry="${(14 + r() * 40).toFixed(0)}" fill="${colors[i % colors.length]}" opacity="${(0.3 * (0.4 + r() * 0.6)).toFixed(2)}"/>`;
    return s;
  }

  function confetti() {
    const r = rng(99);
    const cols = ['#E8B33C', '#ffffff', '#F26A1B', '#ffd77a'];
    let s = '';
    for (let i = 0; i < 90; i++) s += `<rect x="${(r() * W).toFixed(0)}" y="${(r() * H).toFixed(0)}" width="${(4 + r() * 6).toFixed(0)}" height="${(2 + r() * 3).toFixed(0)}" fill="${cols[i % 4]}" opacity=".75" transform="rotate(${(r() * 180).toFixed(0)} 300 400)"/>`;
    return s;
  }

  const dim = op => `<rect width="${W}" height="${H}" fill="#080b16" opacity="${op}"/>`;

  // Regular season: Classic Hardwood
  // Regular season: the month name in the same dark blue as the painted keys
  function regular(month) {
    return wood(['#d4a46a', '#c9985e', '#dcae75', '#c4925a', '#d09f66', '#cfa16b'], 0.55, null)
      + lines('#fffaf0', 4, '#1d2a52', 0.9)
      + dunkLogo()
      + sideText(month, '#1d2a52')
      + cornerLogos('#1d2a52', '#fffaf0', '#fffaf0', '#F26A1B')
      + dim(0.4);
  }

  // Playoffs and Finals: Prime-Time Arena
  function arena(phase) {
    const T = phase === 'playoffs'
      ? { base: ['#3a2218', '#341e15', '#3e251a', '#311c13', '#371f16', '#3c2419'], line: '#ffd2b8', paint: '#4a0f14', light: '#ff5a3d', lights: ['#ff5a3d', '#ffb08a', '#ffffff'], word: 'PLAYOFFS' }
      : { base: ['#3d2e18', '#372914', '#41311b', '#342713', '#3a2c16', '#3f301a'], line: '#ffe7a6', paint: '#4a3608', light: '#ffcf5a', lights: ['#ffcf5a', '#ffffff', '#ffe7a6'], word: 'THE FINALS' };
    return `${wood(T.base, 0.5, null)}
      <defs>
        <radialGradient id="ctSpot" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="${T.light}" stop-opacity=".38"/><stop offset=".55" stop-color="${T.light}" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
        <filter id="ctBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
      </defs>
      <g filter="url(#ctBlur)">${arenaLights(phase === 'playoffs' ? 248 : 186, T.lights)}</g>
      ${lines(T.line, 3.5, T.paint, 0.85)}
      ${phase === 'finals' ? trophyLogo(T.light) : centerLogo(T.paint, T.line, 'PLAYOFFS')}
      <rect width="${W}" height="${H}" fill="url(#ctSpot)"/>
      ${phase === 'finals' ? confetti() : ''}
      ${sideText(T.word, '#0b0b0d', T.line)}
      ${cornerLogos('#0e0f14', T.line, T.line, T.light)}
      ${dim(0.22)}`;
  }

  // phase: 'regular' | 'playoffs' | 'finals'. month: shown on regular-season courts
  F.V.court = (phase, month = '') => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${phase === 'regular' ? regular(month.toUpperCase()) : arena(phase)}</svg>`;
  F.V.courtPhase = act => (act < 6 ? 'regular' : act === 6 ? 'playoffs' : 'finals');
})(FCD);
