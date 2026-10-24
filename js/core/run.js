// The run: everything about the current season (resets every run).
// Also: Meta (Rings + Front Office upgrades, kept forever) and saving.
(function (F) {
  const U = F.U;
  const cfg = () => F.CONFIG;
  const Run = {};

  // A star's starting stats are all +0: only points gained on top of them
  // (Training Camp Ring upgrades or stats earned during the season) raise the bonus.
  Run.statStart = (charId, stat) => F.CHARACTERS[charId].stats[stat] || 0;
  Run.statBonus = (run, stat) =>
    Math.floor(((run.stats[stat] || 0) - Run.statStart(run.charId, stat)) / cfg().STAT_POINTS_PER_BONUS);

  Run.rollSerial = tier => {
    const p = F.TIERS[tier].print;
    return p ? U.randInt(1, p) : 0;
  };

  Run.makeCard = (run, id, tier) => ({
    uid: run ? run.nextUid++ : 0,
    id,
    tier: tier || 0,
    serial: Run.rollSerial(tier || 0),
  });

  Run.has = (run, itemId) => run.memorabilia.includes(itemId);

  Run.calcMaxStamina = run =>
    cfg().STAMINA_BASE + run.stats.STA * cfg().STAMINA_PER_STAT_POINT + run.bonusStamina;

  Run.refreshMax = run => {
    const old = run.maxStamina;
    run.maxStamina = Run.calcMaxStamina(run);
    if (run.maxStamina > old) run.stamina += run.maxStamina - old;
    run.stamina = Math.min(run.stamina, run.maxStamina);
  };

  Run.addStat = (run, stat, n) => {
    run.stats[stat] = U.clamp(run.stats[stat] + n, 1, cfg().STAT_MAX);
    if (stat === 'STA') Run.refreshMax(run);
  };

  Run.heal = (run, n) => {
    const before = run.stamina;
    run.stamina = Math.min(run.maxStamina, run.stamina + Math.max(0, Math.round(n)));
    return run.stamina - before;
  };

  Run.damage = (run, n) => {
    run.stamina = Math.max(0, run.stamina - Math.max(0, Math.round(n)));
  };

  Run.addMemorabilia = (run, id) => {
    if (Run.has(run, id)) return false;
    run.memorabilia.push(id);
    const p = F.MEMORABILIA[id];
    if (p.onGain) p.onGain(run);
    return true;
  };

  Run.availableMemorabilia = run => Object.keys(F.MEMORABILIA).filter(id => !Run.has(run, id));

  Run.statGain = run =>
    F.STATS.reduce((s, st) => s + Math.max(0, run.stats[st.key] - run.baseStats[st.key]), 0);


  // Upgrades stop at /10. A 1/1 can only be pulled from a pack.
  Run.MAX_UPGRADE_TIER = F.TIERS.length - 2;
  Run.canUpgrade = card => F.CARDS[card.id].type !== 'status' && card.tier < Run.MAX_UPGRADE_TIER;
  // Practice / Locker Room upgrade points this upgrade costs: reaching /25 or /10 uses both
  Run.upgradeCost = card => (card.tier + 1 >= cfg().BIG_UPGRADE_TIER ? 2 : 1);

  Run.upgradeCard = (run, uid) => {
    const card = run.deck.find(c => c.uid === uid);
    if (!card || !Run.canUpgrade(card)) return null;
    card.tier += 1;
    card.serial = Run.rollSerial(card.tier);
    return card;
  };

  // Upgrade n different random cards one tier each. Returns the upgraded cards.
  Run.upgradeRandom = (run, n = 1) =>
    U.shuffle(run.deck.filter(Run.canUpgrade)).slice(0, n).map(c => Run.upgradeCard(run, c.uid));

  Run.removeCard = (run, uid) => {
    const i = run.deck.findIndex(c => c.uid === uid);
    if (i >= 0) run.deck.splice(i, 1);
  };

  Run.sellValue = card => {
    const table = F.SELL_PRICES[F.CARDS[card.id].pool] || F.SELL_PRICES.base;
    return table[card.tier] || F.SELL_PRICES.base[card.tier];
  };

  // How exciting a pull is (used for "best pull" on the season summary)
  Run.pullScore = card => card.tier * 10 + (F.CARDS[card.id].pool === 'showtime' ? 15 : 0) + (F.CARDS[card.id].type === 'auto' ? 5 : 0);

  Run.trackPull = (run, card) => {
    if (!run.pulls) run.pulls = [];
    run.pulls.push({ id: card.id, tier: card.tier, serial: card.serial });
    if (!run.bestPull || Run.pullScore(card) > Run.pullScore(run.bestPull)) run.bestPull = { id: card.id, tier: card.tier, serial: card.serial };
  };

  Run.create = (charId, meta) => {
    const ch = F.CHARACTERS[charId];
    const up = meta.upgrades || {};
    const run = {
      version: 1,
      charId,
      stats: { ...ch.stats },
      baseStats: { ...ch.stats },
      bonusStamina: 5 * (up.conditioning || 0),
      maxStamina: 0,
      stamina: 0,
      bucks: cfg().STARTING_BUCKS + 20 * (up.signing || 0),
      deck: [],
      memorabilia: [],
      act: 0,
      map: null,
      pos: null,
      path: [],
      record: { w: 0, l: 0 },
      nextUid: 1,
      bestPull: null,
      pulls: [],
      playMs: 0,
      finals: null,
      ringsEarned: 0,
      eventsSeen: [],
      usedTeams: [],
      shopState: null,
      startPacks: [],
      extraPick: up.scout ? 1 : 0,
    };
    // Training Camp: +1 to two random stats per level (counts as a gain over the Rookie Card)
    for (let i = 0; i < (up.camp || 0); i++) {
      U.shuffle(F.STATS.map(s => s.key)).slice(0, 2).forEach(k => {
        run.stats[k] = Math.min(cfg().STAT_MAX, run.stats[k] + 1);
      });
    }
    // Performance Enhancing Drugs: this star's permanent stat boosts
    const ped = (meta.ped && meta.ped[charId]) || {};
    Object.keys(ped).forEach(k => {
      if (k in run.stats) run.stats[k] = Math.min(cfg().STAT_MAX, run.stats[k] + ped[k]);
    });
    run.maxStamina = Run.calcMaxStamina(run);
    run.stamina = run.maxStamina;
    F.STARTING_DECKS[charId].forEach(id => run.deck.push(Run.makeCard(run, id, 0)));
    if (up.vip) run.startPacks.push('legends');
    run.map = F.Map.generate(0);
    return run;
  };

  F.Run = Run;

  // ---------------- Front Office upgrades (bought with Rings) ----------------
  F.UPGRADES = [
    // costs: Rings for level 1, level 2, ... (the number of costs = number of levels)
    { id: 'signing', name: 'Signing Bonus', text: 'Start each season with +20 Bucks per level.', costs: [5, 10, 20] },
    { id: 'conditioning', name: 'Conditioning Coach', text: '+5 max Stamina per level.', costs: [10, 20, 30] },
    { id: 'camp', name: 'Training Camp', text: 'Each level: start the season with +1 to two random stats.', costs: [25, 50, 100] },
    { id: 'vip', name: 'Card Show VIP', text: 'Open a free Legends Pack at the start of each season.', costs: [100] },
    { id: 'scout', name: 'Scouting Department', text: 'Packs give you one extra card to pick from.', costs: [200] },
  ];

  // Performance Enhancing Drugs: bought separately for each star (stored in meta.ped[charId] = { stat: points }).
  // Each level is +1 to a stat you pick. Levels 1-8 can each go on a different stat (once per stat);
  // the last level can go on any stat.
  F.PED = {
    name: 'Performance Enhancing Drugs',
    text: 'Each level: +1 to a stat of your choice, for one star. Each stat can be boosted once; the final level can go on any stat.',
    costs: [75, 75, 75, 75, 75, 75, 75, 75, 150],
    level: (meta, charId) => Object.values((meta.ped && meta.ped[charId]) || {}).reduce((s, n) => s + n, 0),
    cost: (meta, charId) => { const c = F.PED.costs[F.PED.level(meta, charId)]; return c == null ? null : c; },
    // Can this stat take the next level?
    canPick: (meta, charId, stat) => {
      const lvl = F.PED.level(meta, charId);
      if (lvl >= F.PED.costs.length) return false;
      if (lvl === F.PED.costs.length - 1) return true;
      return !((meta.ped && meta.ped[charId]) || {})[stat];
    },
    buy: (meta, charId, stat) => {
      const cost = F.PED.cost(meta, charId);
      if (cost == null || meta.rings < cost || !F.PED.canPick(meta, charId, stat)) return false;
      meta.rings -= cost;
      if (!meta.ped) meta.ped = {};
      if (!meta.ped[charId]) meta.ped[charId] = {};
      meta.ped[charId][stat] = (meta.ped[charId][stat] || 0) + 1;
      return true;
    },
  };

  // ---------------- Saving (browser storage) ----------------
  F.Meta = {
    data: null,
    load() {
      try { this.data = JSON.parse(localStorage.getItem('fcd_meta')); } catch (e) { this.data = null; }
      if (!this.data) this.data = { rings: 0, upgrades: {}, runs: 0, titles: 0, best: -1 };
      return this.data;
    },
    save() {
      try { localStorage.setItem('fcd_meta', JSON.stringify(this.data)); } catch (e) { /* storage unavailable */ }
    },
  };

  F.Save = {
    saveRun(run) {
      try { localStorage.setItem('fcd_run', JSON.stringify(run)); } catch (e) { /* storage unavailable */ }
    },
    loadRun() {
      try {
        const s = localStorage.getItem('fcd_run');
        return s ? JSON.parse(s) : null;
      } catch (e) { return null; }
    },
    clearRun() {
      try { localStorage.removeItem('fcd_run'); } catch (e) { /* storage unavailable */ }
    },
  };
})(FCD);
