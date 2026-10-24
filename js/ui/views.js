// Reusable pieces of HTML: cards, the Rookie Card, packs, icons.
(function (F) {
  const V = {};
  const esc = s => F.U.esc(s);

  // ---------- Icons ----------
  V.icon = {
    shot: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17" fill="#F26A1B"/><path d="M7 24h34M24 7v34M12 12c7 6 7 18 0 24M36 12c-7 6-7 18 0 24" stroke="#3a1606" stroke-width="2" fill="none"/></svg>',
    defense: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5l16 6v12c0 10-7 17-16 20C15 40 8 33 8 23V11z" fill="#4D8DFF"/><path d="M24 10l11 4v9c0 7-5 12-11 15z" fill="#9cc3ff" opacity=".55"/></svg>',
    play: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 30c8-14 22-18 34-12" stroke="#3FCB7E" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="2 6"/><path d="M34 11l8 7-10 4z" fill="#3FCB7E"/><circle cx="10" cy="32" r="5" fill="#F26A1B"/></svg>',
    auto: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 31c5-9 8-12 10-9s-3 9 1 9 6-14 9-13-2 12 2 12 5-8 8-7 1 5 8 4" stroke="#E8B33C" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 38h32" stroke="#E8B33C" stroke-width="1.5" opacity=".6"/></svg>',
    status: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 30l8-8 6 6 8-10 10 10" stroke="#8E98B5" stroke-width="4" fill="none" stroke-linecap="round"/></svg>',
  };

  V.nodeIcon = {
    game: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="currentColor"/><path d="M6 16h20M16 6v20M10 9c4 4 4 10 0 14M22 9c-4 4-4 10 0 14" stroke="var(--node-bg)" stroke-width="1.6" fill="none"/></svg>',
    rivalry: '<svg viewBox="0 0 32 32"><path d="M16 4c2 6 8 8 8 15a8 8 0 01-16 0c0-4 2-6 4-8 0 3 1 5 3 5-1-5 0-9 1-12z" fill="currentColor"/></svg>',
    shop: '<svg viewBox="0 0 32 32"><rect x="8" y="6" width="16" height="22" rx="2" fill="currentColor"/><path d="M8 11h16M8 23h16" stroke="var(--node-bg)" stroke-width="1.6"/><path d="M12 6l4-3 4 3" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
    practice: '<svg viewBox="0 0 32 32"><rect x="3" y="11" width="4" height="10" rx="1" fill="currentColor"/><rect x="25" y="11" width="4" height="10" rx="1" fill="currentColor"/><rect x="7" y="8" width="4" height="16" rx="1" fill="currentColor"/><rect x="21" y="8" width="4" height="16" rx="1" fill="currentColor"/><rect x="11" y="14.5" width="10" height="3" fill="currentColor"/></svg>',
    locker: '<svg viewBox="0 0 32 32"><rect x="5" y="5" width="10" height="22" rx="1.5" fill="currentColor"/><rect x="17" y="5" width="10" height="22" rx="1.5" fill="currentColor"/><path d="M8 9h4M8 12h4M20 9h4M20 12h4" stroke="var(--node-bg)" stroke-width="1.4"/></svg>',
    event: '<svg viewBox="0 0 32 32"><text x="16" y="24" text-anchor="middle" font-size="22" font-weight="900" font-family="Big Shoulders Display, Arial Black, sans-serif" fill="currentColor">?</text></svg>',
    treasure: '<svg viewBox="0 0 32 32"><rect x="5" y="13" width="22" height="14" rx="1.5" fill="currentColor"/><rect x="4" y="9" width="24" height="5" rx="1" fill="currentColor"/><path d="M16 9v18" stroke="var(--node-bg)" stroke-width="2"/><path d="M16 9c-3-6-9-4-6 0M16 9c3-6 9-4 6 0" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
    boss: '<svg viewBox="0 0 32 32"><path d="M4 24l2-14 6 6 4-9 4 9 6-6 2 14z" fill="currentColor"/><rect x="4" y="25" width="24" height="3" fill="currentColor"/></svg>',
    playoff: '<svg viewBox="0 0 32 32"><path d="M9 4h14v6a7 7 0 01-14 0z" fill="currentColor"/><path d="M9 6H5c0 5 2 7 5 7M23 6h4c0 5-2 7-5 7" stroke="currentColor" stroke-width="2" fill="none"/><rect x="14" y="16" width="4" height="7" fill="currentColor"/><rect x="9" y="23" width="14" height="4" rx="1" fill="currentColor"/></svg>',
  };
  V.nodeIcon.finals = V.nodeIcon.playoff;

  // ---------- Play cards (modern chrome; Showtime = comic) ----------
  V.serialText = card => {
    const t = F.TIERS[card.tier];
    if (!t.print) return 'BASE';
    if (t.print === 1) return '1/1';
    return `#${String(card.serial).padStart(String(t.print).length, '0')}/${t.print}`;
  };

  // Card-name size on the picture, so long names still fit on one line
  function titleSize(d) {
    const n = d.name.length;
    return n <= 12 ? 16 : n <= 16 ? 14 : n <= 20 ? 12.5 : 11;
  }

  // opts: { tag: 'button'|'div', attrs: '', cls: '', combat: c }
  V.card = (run, card, opts = {}) => {
    const d = F.CARDS[card.id];
    const t = F.TIERS[card.tier];
    const c = opts.combat || null;
    const v = F.Combat.cardValue(run, c, card);
    const cost = F.Combat.cardCost(run, c, card);
    const baseCost = d.cost;
    let vCls = '';
    if (v != null && d.base != null) vCls = v > d.base ? 'up' : v < d.base ? 'down' : '';
    const text = esc(F.Combat.cardText(card)).replace('{v}', v == null ? '' : `<b class="${vCls}">${v}</b>`);
    const tag = opts.tag || 'div';
    const classes = ['card', `t-${t.key}`, `ty-${d.type}`];
    if (d.pool === 'showtime') classes.push('showtime');
    if (opts.cls) classes.push(opts.cls);
    if (d.name.length > 15 || d.name.split(' ').some(w => w.length > 9)) classes.push('long-name');
    if (d.name.split(' ').some(w => w.length > 11)) classes.push('xlong-name');
    const costCls = cost != null && cost < baseCost ? 'cheap' : '';
    // Signature cards: the star's picture with the card name in it, plus his autograph
    const owner = d.owner && F.CHARACTERS[d.owner];
    // Every other card: a scene from js/ui/card-art.js (falls back to a simple icon)
    const scene = !owner && V.cardArt ? V.cardArt(card, run) : null;
    if (owner) classes.push('sig');
    if (scene) classes.push('pic');
    if (F.Combat.cardText(card).replace('{v}', '00').length > 52) classes.push('long-text');
    // Autographs: your star signs across the picture
    const signer = d.type === 'auto' ? ((run && F.CHARACTERS[run.charId]) || { name: 'Full Court' }) : null;
    const stamps = `${d.pool === 'showtime' ? '<span class="c-st">SHOWTIME</span>' : ''}${d.type === 'auto' ? '<span class="c-auto">AUTO</span>' : ''}${signer ? `<span class="pic-sign" aria-hidden="true">${esc(signer.name)}</span>` : ''}`;
    const art = owner
      ? `<span class="c-art sig-art">${d.id === 'king_coast' && V.coastToCoastArt ? V.coastToCoastArt(owner)
        : d.id === 'chef_special' && V.chefSpecialArt ? V.chefSpecialArt(owner)
        : V.playerArt(owner, { viewBox: '40 6 120 96' })}<span class="sig-title">${esc(d.name)}</span></span>`
      : scene
        ? `<span class="c-art sig-art">${scene}<span class="sig-title" style="font-size:${titleSize(d)}px">${esc(d.name)}</span>${stamps}</span>`
        : `<span class="c-art">${V.icon[d.type]}${stamps}</span>`;
    return `<${tag} class="${classes.join(' ')}" ${opts.attrs || ''}>
      ${d.unplayable ? '' : `<span class="c-cost ${costCls}">${cost}</span>`}
      <span class="c-name">${esc(d.name)}</span>
      ${art}
      <span class="c-type">${F.TYPE_LABELS[d.type]}${d.stat ? ` · ${d.stat}` : ''}</span>
      <span class="c-text">${text}</span>
      ${owner ? `<span class="c-sign" aria-hidden="true">${esc(owner.name)}</span>` : ''}
      <span class="c-serial">${V.serialText(card)}</span>
    </${tag}>`;
  };

  // Modern "RC" rookie logo: red shield, white RC lettering
  const rcLogo = `<svg class="r-rc" viewBox="0 0 60 64" aria-label="Rookie Card">
    <path d="M6 4 H54 Q57 4 57 7 V36 Q57 52 30 61 Q3 52 3 36 V7 Q3 4 6 4 Z" fill="#fff"/>
    <path d="M9 8 H51 Q53 8 53 10 V35 Q53 48 30 56 Q7 48 7 35 V10 Q7 8 9 8 Z" fill="#D2202F"/>
    <path d="M9 8 H51 Q53 8 53 10 V18 Q30 24 7 18 V10 Q7 8 9 8 Z" fill="#fff" opacity=".18"/>
    <text x="30" y="40" text-anchor="middle" font-family="'Big Shoulders Display', Impact, sans-serif" font-size="30" font-weight="900" font-style="italic" fill="#fff" letter-spacing="-1" stroke="#8E0F1A" stroke-width=".6" paint-order="stroke">RC</text>
  </svg>`;

  // ---------- Character Card (retro) ----------
  // The player picture comes from js/ui/player-art.js, or from an image
  // file if the character has one set in js/data/characters.js
  V.rookieCard = (charId, run, cls = '') => {
    const ch = F.CHARACTERS[charId];
    return `<div class="rookie ${cls}" style="--jersey:${ch.colors.jersey};--trim:${ch.colors.trim}">
      <div class="r-photo">${ch.image ? `<img src="${esc(ch.image)}" alt="">` : V.playerArt(ch)}</div>
      ${rcLogo}
      <div class="r-foot">
        <div class="r-team">${esc(ch.teamShort)}</div>
        <div class="r-name">${esc(ch.name.toUpperCase())}</div>
        <div class="r-info">${esc(ch.pos)} · #${ch.number}</div>
      </div>
    </div>`;
  };

  // start: the star's starting stats (all +0). Leave it out to show +0 everywhere.
  V.statTable = (stats, base, start = stats) => `<div class="stat-table">${F.STATS.map(s => {
    const v = stats[s.key];
    const gain = base ? v - base[s.key] : 0;
    const bonus = Math.floor((v - start[s.key]) / F.CONFIG.STAT_POINTS_PER_BONUS);
    return `<div class="st-row">
      <span class="st-key">${s.key}</span>
      <span class="st-bar"><i style="width:${Math.min(100, (v / 12) * 100)}%"></i></span>
      <span class="st-val">${v}</span>
      ${s.key === 'STA'
        ? `<span class="st-bonus ${gain > 0 ? 'pos' : ''}" title="Stamina sets your max health. No cards use it.${gain > 0 ? ` Gained +${gain} this season.` : ''}">${gain > 0 ? `+${gain}` : 'HP'}</span>`
        : `<span class="st-bonus ${gain > 0 ? 'pos' : ''}" title="Points gained this season: +${gain}. Every ${F.CONFIG.STAT_POINTS_PER_BONUS} points add +1 to ${s.label} cards (now +${bonus}).">${gain > 0 ? `+${gain}` : '0'}</span>`}
    </div>`;
  }).join('')}</div>`;

  // Memorabilia items are drawn in js/ui/memorabilia-art.js

  // ---------- Pack wrapper ----------
  V.pack = (type, theme, cls = '') => {
    const p = F.PACKS[type];
    return `<div class="pack pk-${type} ${cls}">
      <span class="pk-brand">FULL COURT DECK</span>
      <span class="pk-name">${type === 'mystery' ? '?' : esc(p.name.replace(' Pack', ''))}</span>
      <span class="pk-sub">${theme ? esc(F.THEMES[theme]) : type === 'mystery' ? 'Mystery Pack' : 'Series 1'}</span>
      <span class="pk-foot">${F.CONFIG.PACK_CARDS} cards · bonus hits</span>
    </div>`;
  };

  F.V = V;
})(FCD);
