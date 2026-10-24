// Binder Collection: every card you have pulled, saved forever per character.
// Pulls are collected during a season (run.pulls) and added to the
// binder when the season ends, win or lose.
(function (F) {
  const Binder = {};
  const MAX_SERIALS = 8; // how many serial numbers to remember per tier

  Binder.data = meta => {
    if (!meta.binder) meta.binder = {};
    return meta.binder;
  };

  Binder.forChar = (meta, charId) => {
    const b = Binder.data(meta);
    if (!b[charId]) b[charId] = { cards: {}, items: [], seasons: 0 };
    // Older saves called memorabilia "patches"
    if (b[charId].patches) { b[charId].items = b[charId].patches; delete b[charId].patches; }
    return b[charId];
  };

  function add(cb, id, tier, serial) {
    const entry = (cb.cards[id] = cb.cards[id] || {});
    const t = (entry[tier] = entry[tier] || { n: 0, s: [] });
    t.n++;
    if (serial && !t.s.includes(serial)) {
      t.s.push(serial);
      if (t.s.length > MAX_SERIALS) t.s.shift();
    }
  }

  // Called once when a season ends (completed or failed)
  Binder.record = (meta, run) => {
    const cb = Binder.forChar(meta, run.charId);
    cb.seasons++;
    (run.pulls || []).forEach(p => add(cb, p.id, p.tier, p.serial));
    // Cards that can't come from packs count once you've had them in a deck.
    // Signature cards also count every serial tier they were upgraded through this season.
    run.deck.forEach(c => {
      const pool = F.CARDS[c.id].pool;
      if (pool !== 'starter' && pool !== 'status') return;
      const top = pool === 'starter' ? c.tier : 0;
      for (let t = 0; t <= top; t++) {
        if (!(cb.cards[c.id] && cb.cards[c.id][t])) add(cb, c.id, t, t === top && t > 0 ? c.serial : 0);
      }
    });
    run.memorabilia.forEach(id => { if (!cb.items.includes(id)) cb.items.push(id); });
  };

  // Which serial tiers a card can come in
  Binder.tiersFor = d => {
    if (d.pool === 'showtime') return [3, 4, 5, 6];
    // Signature cards: Base up to the highest tier upgrades can reach (/10)
    if (d.pool === 'starter') return Array.from({ length: F.Run.MAX_UPGRADE_TIER + 1 }, (_, i) => i);
    if (d.pool === 'status') return [0];
    const from = d.levels ? d.levels.findIndex(Boolean) : 0; // e.g. Signed Sharpshooter starts at /250
    return [0, 1, 2, 3, 4, 5, 6].slice(from);
  };

  // The binder's pages for one character
  Binder.sections = charId => {
    const all = Object.values(F.CARDS);
    const byName = (a, b) => a.name.localeCompare(b.name);
    const pick = fn => all.filter(fn).sort(byName).map(d => d.id);
    return [
      { title: 'Signature card', ids: pick(d => d.pool === 'starter' && F.STARTING_DECKS[charId].includes(d.id)) },
      { title: 'Scoring', ids: pick(d => d.pool === 'base' && d.type === 'shot') },
      { title: 'Defense', ids: pick(d => d.pool === 'base' && d.type === 'defense') },
      { title: 'Playmaking', ids: pick(d => d.pool === 'base' && d.type === 'play') },
      { title: 'Autographs', ids: pick(d => d.pool === 'auto') },
      { title: 'Showtime inserts', ids: pick(d => d.pool === 'showtime') },
      { title: 'Other', ids: pick(d => d.pool === 'status') },
    ].filter(s => s.ids.length);
  };

  Binder.progress = (meta, charId) => {
    const cb = Binder.forChar(meta, charId);
    let cards = 0, cardsHave = 0, serials = 0, serialsHave = 0;
    Binder.sections(charId).forEach(s => s.ids.forEach(id => {
      const tiers = Binder.tiersFor(F.CARDS[id]);
      const entry = cb.cards[id] || {};
      cards++;
      if (tiers.some(t => entry[t])) cardsHave++;
      serials += tiers.length;
      serialsHave += tiers.filter(t => entry[t]).length;
    }));
    return { cards, cardsHave, serials, serialsHave, items: cb.items.length, itemsTotal: Object.keys(F.MEMORABILIA).length, seasons: cb.seasons };
  };

  F.Binder = Binder;
})(FCD);
