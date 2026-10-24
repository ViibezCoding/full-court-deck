// Pack opening and shop stock.
(function (F) {
  const U = F.U;
  const Packs = {};

  Packs.themeOf = d => {
    if (d.type === 'shot') return d.stat === 'SHO' ? 'shooting' : 'inside';
    if (d.type === 'defense') return 'defense';
    if (d.type === 'play') return 'playmaking';
    return null;
  };

  Packs.pool = (poolName, theme) =>
    Object.values(F.CARDS).filter(d => d.pool === poolName && (!theme || Packs.themeOf(d) === theme));

  function rollId(poolName, theme) {
    let pool = Packs.pool(poolName, theme);
    if (!pool.length) pool = Packs.pool(poolName);
    return U.weighted(pool, d => F.RARITY_WEIGHTS[d.rarity] || 3).id;
  }

  // Open a pack. Returns { cards, hit }. Nothing is added to the run here
  // A bonus Autograph is offered too: the player chooses to keep it or pass.
  Packs.open = (run, typeKey, theme) => {
    const pack = F.PACKS[typeKey];
    const n = F.CONFIG.PACK_CARDS + (run.extraPick || 0);
    const cards = [];
    for (let i = 0; i < n; i++) {
      const odds = i === 0 && pack.guaranteed ? pack.guaranteed : pack.odds;
      const tier = U.weightedIndex(odds);
      cards.push(F.Run.makeCard(null, rollId(pack.pool, pack.themed ? theme : null), tier));
    }
    if (Math.random() < pack.showtime) {
      const id = U.pick(Packs.pool('showtime')).id;
      cards[cards.length - 1] = F.Run.makeCard(null, id, U.weightedIndex(F.SHOWTIME_ODDS));
    }
    // Shuffle so the guaranteed card isn't always first
    const shuffled = U.shuffle(cards);

    // Bonus hit: an Autograph card (memorabilia never comes from packs).
    // Not added to the deck here: the player chooses to keep it or pass.
    let hit = null;
    if (Math.random() < pack.hit) {
      const d = U.pick(Packs.pool('auto'));
      // Some Autographs only come in higher tiers: roll among the tiers they have
      const from = d.levels ? d.levels.findIndex(Boolean) : 0;
      const odds = (pack.autoOdds || pack.odds).map((w, i) => (i < from ? 0 : w));
      const tier = odds.some(w => w > 0) ? U.weightedIndex(odds) : from;
      const card = F.Run.makeCard(run, d.id, tier);
      F.Run.trackPull(run, card);
      hit = { kind: 'auto', card };
    }
    shuffled.forEach(c => F.Run.trackPull(run, c));
    return { cards: shuffled, hit };
  };

  // Add a picked card from a pack to the deck
  Packs.take = (run, card) => {
    const c = { ...card, uid: run.nextUid++ };
    run.deck.push(c);
    return c;
  };

  Packs.price = p => p.price;

  // Chance of getting at least one /99-or-better card (shown in the shop)
  Packs.rareChance = typeKey => {
    const pack = F.PACKS[typeKey];
    const n = F.CONFIG.PACK_CARDS;
    const pRare = odds => {
      const total = odds.reduce((a, b) => a + b, 0);
      return odds.slice(3).reduce((a, b) => a + b, 0) / total;
    };
    if (pack.guaranteed) return 1;
    const miss = Math.pow(1 - pRare(pack.odds), n) * (1 - pack.showtime);
    return 1 - miss;
  };

  Packs.shopStock = () => {
    const stock = [];
    stock.push({ type: 'base', price: F.PACKS.base.price, sold: false });
    stock.push({ type: 'team', theme: U.pick(Object.keys(F.THEMES)), price: F.PACKS.team.price, sold: false });
    stock.push({ type: 'legends', price: F.PACKS.legends.price, sold: false });
    const [lo, hi] = F.PACKS.mystery.priceRange;
    stock.push({ type: 'mystery', price: U.randInt(lo, hi), sold: false });
    return stock;
  };

  F.Packs = Packs;
})(FCD);
