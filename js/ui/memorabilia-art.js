// Memorabilia item drawings and their display cases.
(function (F) {
  const V = F.V;
  const esc = s => F.U.esc(s);

  // A sharpie autograph scribble
  const sig = (color, x = 0, y = 0) =>
    `<path transform="translate(${x} ${y})" d="M0 4 q3 -7 5 -1 t4 0 q2 -6 4 0 q1 4 4 -1 q2 -3 5 1 l6 -3" stroke="${color}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

  // Each drawing uses a 64x64 box. a = main color, b = accent color.
  const DRAW = {
    sneaker: (a, b) => `
      <path d="M6 30 Q6 24 12 22 L22 18 Q26 14 30 18 L34 24 Q42 28 54 32 Q60 34 60 40 L60 44 L6 44 Z" fill="${a}"/>
      <path d="M6 30 Q6 24 12 22 L15 32 L6 34 Z" fill="${b}"/>
      <path d="M4 44 L62 44 Q62 51 56 51 L9 51 Q4 51 4 44 Z" fill="#f2f2f2"/>
      <path d="M4 47 L62 47" stroke="#cfcfcf" stroke-width="1"/>
      <path d="M16 37 Q32 33 48 40" stroke="${b}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M23 21 L28 27 M26.5 18.5 L31.5 24.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
      ${sig('#fff', 34, 27)}`,
    goggles: (a, b) => `
      <path d="M3 33 Q32 18 61 33" stroke="${b}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <rect x="9" y="25" width="19" height="15" rx="6.5" fill="${a}" fill-opacity=".55" stroke="#e8e8e8" stroke-width="2.5"/>
      <rect x="36" y="25" width="19" height="15" rx="6.5" fill="${a}" fill-opacity=".55" stroke="#e8e8e8" stroke-width="2.5"/>
      <path d="M28 31 h8" stroke="#e8e8e8" stroke-width="3"/>
      <path d="M13 29 l6 0 M40 29 l6 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`,
    jersey: (a, b, item) => `
      <path d="M20 7 Q25 14 32 14 Q39 14 44 7 L51 9 Q48 20 53 26 L53 58 L11 58 L11 26 Q16 20 13 9 Z" fill="${a}"/>
      <path d="M20 7 Q25 14 32 14 Q39 14 44 7" stroke="${b}" stroke-width="2.5" fill="none"/>
      <path d="M13 9 Q16 20 11 26 M51 9 Q48 20 53 26" stroke="${b}" stroke-width="2" fill="none"/>
      <text x="32" y="44" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="19" fill="${b}">${item.number || ''}</text>`,
    jacket: (a, b) => `
      <path d="M18 9 L46 9 L56 17 L61 50 L53 52 L50 31 L50 58 L14 58 L14 31 L11 52 L3 50 L8 17 Z" fill="${a}"/>
      <path d="M24 9 L32 18 L40 9 Z" fill="${b}"/>
      <path d="M32 18 V58" stroke="${b}" stroke-width="1.6"/>
      <path d="M6 24 L56 24" stroke="none"/>
      <path d="M8 21 L4 47 M56 21 L60 47" stroke="${b}" stroke-width="2.5"/>
      <path d="M14 52 H50" stroke="${b}" stroke-width="2.5"/>`,
    bag: (a, b) => `
      <path d="M13 24 Q32 -2 51 24" stroke="${b}" stroke-width="3" fill="none"/>
      <rect x="19" y="13" width="18" height="12" fill="#f4ebd6" transform="rotate(-10 28 19)"/>
      <path d="M20 15 l9 6 l8 -7" stroke="#b9a77d" stroke-width="1" fill="none" transform="rotate(-10 28 19)"/>
      <rect x="7" y="21" width="50" height="34" rx="4" fill="${a}"/>
      <path d="M7 25 Q7 21 11 21 L53 21 Q57 21 57 25 L57 37 Q32 45 7 37 Z" fill="#000" fill-opacity=".28"/>
      <rect x="28" y="36" width="8" height="6" rx="1" fill="${b}"/>
      <text x="32" y="52" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="6" fill="${b}">U.S. MAIL</text>`,
    ball: (a, b) => `
      <circle cx="32" cy="32" r="25" fill="${a}"/>
      <circle cx="32" cy="32" r="25" fill="url(#mBallShade)"/>
      <path d="M7 32 H57 M32 7 V57 M14 14 Q26 32 14 50 M50 14 Q38 32 50 50" stroke="#3a1606" stroke-width="1.6" fill="none"/>
      ${sig(b, 17, 37)}`,
    wristband: (a, b) => `
      <rect x="14" y="21" width="36" height="26" rx="5" fill="${a}"/>
      <ellipse cx="32" cy="21" rx="18" ry="5.5" fill="${a}"/>
      <ellipse cx="32" cy="21" rx="12" ry="3.2" fill="#000" fill-opacity=".35"/>
      <rect x="14" y="32" width="36" height="5" fill="${b}"/>
      ${sig('#fff', 20, 39)}`,
    headband: (a, b) => `
      <path d="M8 40 Q32 8 56 40" stroke="${a}" stroke-width="7" fill="none"/>
      <path d="M8 40 Q32 15 56 40" stroke="#f4a261" stroke-width="4" fill="none"/>
      <path d="M8 40 Q32 21 56 40" stroke="#e9c46a" stroke-width="4" fill="none"/>
      <path d="M8 40 Q32 27 56 40" stroke="${b}" stroke-width="4" fill="none"/>
      <path d="M8 40 Q32 33 56 40" stroke="#4361ee" stroke-width="4" fill="none"/>`,
    sleeve: (a, b) => `
      <path d="M19 6 L45 6 L41 58 L23 58 Z" fill="${a}"/>
      <path d="M19.4 12 L44.6 12" stroke="${b}" stroke-width="3"/>
      <path d="M22 34 Q32 38 42 34" stroke="#000" stroke-opacity=".3" stroke-width="1.5" fill="none"/>
      <path d="M23 50 L41 50" stroke="${b}" stroke-width="2"/>`,
    towel: (a, b) => `
      <path d="M8 10 H56 V12 H8 Z" fill="#9aa3b5"/>
      <path d="M10 12 L54 12 L54 52 Q32 57 10 52 Z" fill="${b}"/>
      <path d="M10 40 L54 40 M10 45 L54 45" stroke="${a}" stroke-width="3"/>
      <path d="M22 12 Q24 30 22 52 M42 12 Q40 30 42 52" stroke="#000" stroke-opacity=".12" stroke-width="2" fill="none"/>`,
    ticket: (a, b) => `
      <g transform="rotate(-8 32 32)">
        <rect x="5" y="18" width="54" height="28" rx="3" fill="${b}"/>
        <path d="M44 19 V45" stroke="${a}" stroke-width="1.2" stroke-dasharray="2 2"/>
        <text x="25" y="28" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="5.5" fill="${a}">ADMIT ONE</text>
        <text x="25" y="37" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="8" fill="${a}">FINALS</text>
        <text x="51.5" y="35" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="6" fill="${a}">44</text>
        ${sig('#111', 11, 38)}
      </g>`,
    net: (a, b) => `
      <rect x="8" y="8" width="48" height="5" rx="2" fill="${b}"/>
      <path d="M10 13 L18 28 L26 13 L34 28 L42 13 L50 28 L54 13 M18 28 L22 44 L30 28 L38 44 L46 28 M22 44 L30 58 L38 44" stroke="${a}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <path d="M14 13 L10 24 M50 13 L54 24" stroke="${a}" stroke-width="2"/>`,
  };

  V.memoIcon = id => {
    const m = F.MEMORABILIA[id];
    const [a, b] = m.colors;
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="mBallShade" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient></defs>${DRAW[m.item](a, b, m)}</svg>`;
  };

  // Shop Mystery Bag: a drawstring sack with a stitched "?"
  V.mysteryBag = () => `<svg class="bag-art" viewBox="0 0 120 120" aria-hidden="true">
    <defs><radialGradient id="bagShade" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#b98652"/><stop offset=".7" stop-color="#7a5230"/><stop offset="1" stop-color="#4d321c"/></radialGradient></defs>
    <ellipse cx="60" cy="110" rx="36" ry="5" fill="rgba(0,0,0,.35)"/>
    <path d="M44 40 Q20 60 22 84 Q24 108 60 108 Q96 108 98 84 Q100 60 76 40 Z" fill="url(#bagShade)"/>
    <path d="M30 66 Q60 58 90 66 M28 96 Q60 102 92 96" stroke="rgba(255,255,255,.22)" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
    <path d="M48 30 Q42 18 52 16 Q60 24 68 16 Q78 18 72 30 Q60 34 48 30 Z" fill="#a8794a"/>
    <path d="M44 40 Q60 46 76 40 L72 30 Q60 34 48 30 Z" fill="#8a5d36"/>
    <path d="M44 40 Q60 48 76 40" stroke="#E8B33C" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M76 40 q7 6 3 15 M76 40 q1 8 -3 15" stroke="#E8B33C" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <text x="60" y="94" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="42" fill="#E8B33C" stroke="#4d321c" stroke-width="1.5">?</text>
  </svg>`;

  // Sponsor Gift: a wrapped box with a bow
  V.giftBox = () => `<svg class="gift-art" viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="60" cy="110" rx="40" ry="5" fill="rgba(0,0,0,.35)"/>
    <rect x="24" y="52" width="72" height="56" rx="4" fill="#1D428A"/>
    <path d="M24 60 H96" stroke="rgba(0,0,0,.25)" stroke-width="3"/>
    <rect x="18" y="40" width="84" height="16" rx="3" fill="#2a57ad"/>
    <rect x="54" y="40" width="12" height="68" fill="#E8B33C"/>
    <path d="M60 40 Q38 16 36 32 Q36 42 60 40 Z M60 40 Q82 16 84 32 Q84 42 60 40 Z" fill="#F2C14E" stroke="#b8862a" stroke-width="1.5"/>
    <circle cx="60" cy="39" r="5" fill="#E8B33C" stroke="#b8862a" stroke-width="1.5"/>
    <g transform="rotate(-12 86 82)"><rect x="76" y="74" width="22" height="14" rx="2" fill="#f4ebd6"/><text x="87" y="84" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="6" fill="#1D428A">FCD</text></g>
  </svg>`;

  // Small item in a mini case (header bar). Hover for details.
  V.memo = id => {
    const m = F.MEMORABILIA[id];
    return `<span class="memo-chip" data-tip="${esc(m.name)}: ${esc(m.text)}" tabindex="0">${V.memoIcon(id)}</span>`;
  };

  // Item in a display case with a brass plaque
  V.memoCard = (id, opts = {}) => {
    const m = F.MEMORABILIA[id];
    return `<div class="memo-card ${opts.empty ? 'empty' : ''}">
      <div class="memo-case">${V.memoIcon(id)}</div>
      <div class="memo-plaque">
        <div class="mc-kind">${esc(m.kind)} · Authenticated</div>
        <div class="mc-name">${esc(m.name)}</div>
        <div class="mc-text">${opts.empty ? 'Not collected yet' : esc(m.text)}</div>
      </div>
    </div>`;
  };
})(FCD);
