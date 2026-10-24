// Combat engine: Offense vs. Defense. No drawing code in here,
// so the rules can be read (and tested) on their own.
(function (F) {
  const U = F.U;
  const cfg = () => F.CONFIG;
  const has = (run, id) => F.Run.has(run, id);
  const C = {};

  const BIG_GAMES = ['boss', 'playoff', 'finals'];

  C.pickTeam = (run, node) => {
    if (node.type === 'boss') return F.TEAMS.marquee[run.act];
    if (node.type === 'playoff') return F.TEAMS.playoffs[node.round];
    if (node.type === 'finals') return F.TEAMS.finals;
    const pool = node.type === 'rivalry' ? F.TEAMS.rivalry : F.TEAMS.normal;
    let options = pool.filter(t => !run.usedTeams.includes(t.name));
    if (!options.length) options = pool;
    const team = U.pick(options);
    run.usedTeams.push(team.name);
    if (run.usedTeams.length > 5) run.usedTeams.shift();
    return team;
  };

  C.start = (run, team, nodeType) => {
    const act = run.act;
    let target = cfg().TARGET_SCORE[act];
    if (nodeType === 'rivalry') target += cfg().RIVALRY_TARGET_BONUS;
    if (BIG_GAMES.includes(nodeType)) target += cfg().MARQUEE_TARGET_BONUS;
    const c = {
      team,
      nodeType,
      act,
      postseason: nodeType === 'playoff' || nodeType === 'finals',
      target,
      scale: cfg().OPP_SCALE[act],
      you: 0,
      opp: 0,
      turn: 0,
      energy: 0,
      maxEnergy: cfg().STARTING_ENERGY,
      bonusEnergyNext: 0,
      draw: U.shuffle(run.deck.map(x => ({ ...x }))),
      hand: [],
      discard: [],
      exhaust: [],
      active: [],
      pendingActive: [], // Autographs played this turn: they switch on next turn
      defense: 0,
      oppDefense: 0,
      oppBuff: 0,
      momentum: 0,
      heat: 0,
      nextShotBonus: 0,
      doubleNext: false,
      turnShotBonus: 0,
      halfNext: false,
      buffs: { sho: 0, fin: 0, momentumPerTurn: 0, defensePerTurn: 0, extraDraw: 0, firstShot: 0 },
      pendingBuffs: {},
      typesPlayed: {},
      versatilityDone: false,
      shotsThisTurn: 0,
      playCardsThisTurn: 0,
      firstShotDone: false,
      moveIdx: U.randInt(0, team.moves.length - 1),
      intent: null,
      log: [],
      fx: [],
      over: null,
      knockout: false,
    };
    pickIntent(c);
    startTurn(run, c);
    return c;
  };

  function scaleMove(m, s, mult = 1) {
    const r = { ...m };
    const power = cfg().OPP_POWER * mult;
    ['pts', 'def'].forEach(k => { if (r[k] != null) r[k] = Math.max(1, Math.round(r[k] * s * power * (k === 'def' ? cfg().OPP_DEFENSE_MULT : cfg().OPP_SCORE_MULT))); });
    if (r.buff != null) r.buff = Math.max(1, Math.round(r.buff * cfg().OPP_SCORE_MULT * power * (1 + (s - 1) * 0.5)));
    return r;
  }

  function pickIntent(c) {
    const m = c.team.moves[c.moveIdx % c.team.moves.length];
    c.moveIdx++;
    c.intent = scaleMove(m, c.scale, c.nodeType === 'boss' ? cfg().MARQUEE_OPP_MULT[c.act] : 1);
  }

  function log(c, text) {
    c.log.push(text);
    if (c.log.length > 30) c.log.shift();
  }

  // What their next play will actually do
  C.intentPreview = c => {
    const it = c.intent;
    let raw = it.pts != null ? it.pts + c.oppBuff : 0;
    if (c.halfNext) raw = Math.floor(raw / 2);
    return { raw, after: Math.max(0, raw - c.defense), def: it.def || 0, buff: it.buff || 0 };
  };

  // A card's numbers at its serial tier.
  // Cards with hand-tuned `levels` (see cards.js) use that tier's own base, cost and
  // extra values. A tier that isn't listed falls back to the Base level plus the
  // usual serial bonus. Cards without `levels` use the formula from config.js.
  C.level = card => {
    const d = F.CARDS[card.id];
    if (!d.levels) return { base: d.base, cost: d.cost, x: d.x, mm: d.momentumMult, text: null, auto: true };
    const lv = d.levels[card.tier];
    if (lv) return { ...lv, auto: false };
    return { ...(d.levels[0] || d.levels.find(Boolean)), auto: true };
  };

  // Card text with this tier's wording and extra number filled in ({v} is filled in by the screen)
  C.cardText = card => {
    const d = F.CARDS[card.id];
    const lv = C.level(card);
    return (lv.text || d.text).replace('{x}', lv.x != null ? lv.x : '');
  };

  // The real number on a card right now (stats + serial + boosts)
  C.cardValue = (run, c, card) => {
    const d = F.CARDS[card.id];
    const lv = C.level(card);
    if (lv.base == null) return null;
    const sb = d.stat ? F.Run.statBonus(run, d.stat) : 0;
    const tb = lv.auto ? F.TIERS[card.tier].valueBonus : 0; // hand-tuned levels already include rarity
    let v = lv.base + Math.round((sb + tb) * d.scale);
    if (c && d.type === 'shot') v += c.turnShotBonus; // No-Look Pass: +value to every scoring card this turn
    if (c && d.type === 'shot' && c.doubleNext) v *= 2; // Isolation doubles the card's own value, before Momentum and boosts
    if (c && d.type === 'shot') {
      v += c.nextShotBonus + c.momentum * (lv.mm || d.momentumMult || 1);
      if (run.charId === 'chef' && d.stat === 'SHO') v += c.heat; // Heat only boosts Shooting cards
      if (d.stat === 'SHO') v += c.buffs.sho;
      if (d.stat === 'FIN') v += c.buffs.fin;
      if (c.shotsThisTurn === 0) v += c.buffs.firstShot;
      if (!c.firstShotDone && has(run, 'airness')) v += 3;
      if (d.bonus) v += d.bonus(c, lv);
    }
    if (c && d.type === 'defense' && d.stat === 'STL' && has(run, 'glove')) v += 2;
    return Math.max(d.type === 'play' && d.text.startsWith('Draw') ? 1 : 0, v);
  };

  C.cardCost = (run, c, card) => {
    const d = F.CARDS[card.id];
    if (d.unplayable) return null;
    const lv = C.level(card);
    let cost = lv.cost;
    if (lv.auto) {
      const t = F.TIERS[card.tier];
      if (t.costCut === 'big' && lv.cost >= 2) cost -= 1;
      if (t.costCut === 'all' && lv.cost >= 1) cost -= 1;
    }
    if (c && d.type === 'play' && c.playCardsThisTurn === 0 && has(run, 'magic')) cost -= 1;
    return Math.max(0, cost);
  };

  C.canPlay = (run, c, card) => {
    const cost = C.cardCost(run, c, card);
    return cost != null && cost <= c.energy && !c.over;
  };

  function drawCards(c, n) {
    for (let i = 0; i < n; i++) {
      if (!c.draw.length) {
        if (!c.discard.length) break;
        c.draw = U.shuffle(c.discard);
        c.discard = [];
      }
      if (c.hand.length >= cfg().MAX_HAND) break;
      c.hand.push(c.draw.pop());
    }
  }

  function makeApi(run, c) {
    return {
      defense: n => { c.defense += n; },
      momentum: n => { c.momentum += n; },
      draw: n => drawCards(c, n),
      energy: n => { c.energy += n; },
      energyNext: n => { c.bonusEnergyNext += n; },
      nextShot: n => { c.nextShotBonus += n; },
      doubleNext: () => { c.doubleNext = true; },
      turnShotBonus: n => { c.turnShotBonus += n; },
      half: () => { c.halfNext = true; },
      heal: n => F.Run.heal(run, n),
      loseStamina: n => F.Run.damage(run, n),
      // Autograph boosts start at the beginning of next turn
      buff: (k, n) => { c.pendingBuffs[k] = (c.pendingBuffs[k] || 0) + n; },
      doubleMomentum: () => { c.momentum *= 2; },
      stripDefense: () => { c.oppDefense = 0; },
      reshuffle: () => { c.draw = U.shuffle(c.draw.concat(c.discard)); c.discard = []; },
    };
  }

  function resolveShot(run, c, d, v) {
    let pts = v;
    let absorbed = 0;
    const ignores = d.ignoreDefense || (d.tags.includes('mid') && has(run, 'captain'));
    if (!ignores && c.oppDefense > 0) {
      absorbed = Math.min(c.oppDefense, pts);
      c.oppDefense -= absorbed;
      pts -= absorbed;
    }
    const blocked = pts === 0 && absorbed > 0;
    c.you += pts;
    c.momentum = 0;
    c.nextShotBonus = 0;
    c.doubleNext = false;
    c.firstShotDone = true;
    c.shotsThisTurn++;
    // The Chef: the HEAT_SHOTS-th scoring card each turn gives +1 Heat (Chef's Special gives extra)
    if (run.charId === 'chef') {
      const gain = (c.shotsThisTurn === cfg().HEAT_SHOTS ? 1 : 0) + (d.extraHeat || 0);
      const heat = Math.min(cfg().HEAT_MAX, c.heat + gain);
      if (heat > c.heat) log(c, `Heating up! Heat ${heat}.`);
      c.heat = heat;
    }
    c.fx.push({ kind: 'score', side: 'you', pts, absorbed, blocked });
    log(c, blocked ? `${d.name} was stopped by their Defense.` : `${d.name}: +${pts}${absorbed ? ` (${absorbed} blocked)` : ''}.`);
  }

  C.play = (run, c, i) => {
    if (c.over) return false;
    const card = c.hand[i];
    if (!card) return false;
    const d = F.CARDS[card.id];
    const cost = C.cardCost(run, c, card);
    if (cost == null || cost > c.energy) return false;
    const v = C.cardValue(run, c, card);
    c.energy -= cost;
    c.hand.splice(i, 1);
    c.typesPlayed[d.type] = true;
    const api = makeApi(run, c);

    if (d.type === 'shot') resolveShot(run, c, d, v);
    else if (d.type === 'defense') { api.defense(v); log(c, `${d.name}: +${v} Defense.`); }
    else log(c, `${d.name}.`);
    if (d.effect) d.effect(api, v, C.level(card));
    if (d.type === 'play') c.playCardsThisTurn++;

    // Memorabilia that react to cards
    if (d.stat === 'REB' && has(run, 'worm')) api.defense(2);
    if (d.stat === 'HDL' && has(run, 'answer')) api.momentum(1);

    if (d.type === 'auto') c.pendingActive.push(card);
    else if (d.exhaust) c.exhaust.push(card);
    else c.discard.push(card);

    // The King: Versatility
    if (run.charId === 'king' && !c.versatilityDone && c.typesPlayed.shot && c.typesPlayed.defense && c.typesPlayed.play) {
      c.versatilityDone = true;
      c.bonusEnergyNext += 1;
      c.fx.push({ kind: 'versatility' });
      log(c, 'Versatility! +1 Energy next turn.');
    }
    checkEnd(run, c);
    return true;
  };

  function startTurn(run, c) {
    c.turn++;
    c.defense = 0;
    c.energy = c.maxEnergy + c.bonusEnergyNext;
    c.bonusEnergyNext = 0;
    c.typesPlayed = {};
    c.versatilityDone = false;
    c.shotsThisTurn = 0;
    c.doubleNext = false;
    c.playCardsThisTurn = 0;
    c.turnShotBonus = 0;
    // Autographs played last turn switch on now
    Object.keys(c.pendingBuffs).forEach(k => { c.buffs[k] += c.pendingBuffs[k]; });
    c.pendingBuffs = {};
    c.active.push(...c.pendingActive);
    c.pendingActive = [];
    c.defense += c.buffs.defensePerTurn;
    c.momentum += c.buffs.momentumPerTurn;
    if (has(run, 'dream')) c.momentum += 1;
    if (has(run, 'bigshot') && c.opp > c.you) c.energy += 1;
    let n = cfg().HAND_SIZE + c.buffs.extraDraw;
    if (c.turn === 1) {
      if (has(run, 'fundamental')) c.defense += 8;
      if (has(run, 'mailman')) n += 1;
    }
    drawCards(c, n);
  }

  C.endTurn = (run, c) => {
    if (c.over) return;
    c.discard.push(...c.hand);
    c.hand = [];

    // The Chef cools off without HEAT_SHOTS scoring cards this turn
    if (run.charId === 'chef' && c.shotsThisTurn < cfg().HEAT_SHOTS && c.heat > 0) {
      log(c, `Cooled off: fewer than ${cfg().HEAT_SHOTS} scoring cards. Heat resets to 0.`);
      c.heat = 0;
    }

    // Their possession
    c.oppDefense = 0;
    const it = c.intent;
    const p = C.intentPreview(c);
    if (it.pts != null) {
      const absorbed = Math.min(c.defense, p.raw);
      const pts = p.raw - absorbed;
      c.opp += pts;
      c.fx.push({ kind: 'score', side: 'opp', pts, absorbed });
      log(c, `${c.team.name} - ${it.name}: +${pts}${absorbed ? ` (you stopped ${absorbed})` : ''}.`);
    }
    if (it.def) { c.oppDefense += it.def; if (it.pts == null) log(c, `${c.team.name} - ${it.name}: +${it.def} Defense.`); }
    if (it.buff) { c.oppBuff += it.buff; log(c, `${c.team.name} - ${it.name}: their plays score +${it.buff}.`); }
    c.halfNext = false;

    // Unused Momentum fades: only part of it carries into your next turn (rounded down)
    if (c.momentum > 0) {
      const kept = Math.floor(c.momentum * cfg().MOMENTUM_CARRYOVER);
      if (kept < c.momentum) log(c, `Momentum cools off: ${c.momentum} → ${kept}.`);
      c.momentum = kept;
    }

    checkEnd(run, c);
    if (c.over) return;
    pickIntent(c);
    startTurn(run, c);
  };

  function checkEnd(run, c) {
    if (c.over) return;
    if (c.you >= c.target) c.over = 'win';
    else if (c.opp >= c.target) c.over = 'loss';
    else if (run.stamina <= 0 && !c.postseason) { c.over = 'loss'; c.knockout = true; }
  }

  // Bucks and rewards after a win
  C.rewards = (run, c, node) => {
    const margin = Math.max(0, c.you - c.opp);
    let base = cfg().BUCKS_WIN_BASE + cfg().BUCKS_WIN_STEP * Math.floor(run.act / cfg().BUCKS_WIN_STEP_MONTHS);
    let marginB = Math.min(cfg().BUCKS_MARGIN_CAP, Math.floor(margin / cfg().BUCKS_MARGIN_POINTS_PER_BUCK));
    let mult = 1;
    if (node.type === 'rivalry') mult = cfg().RIVALRY_BUCKS_MULT;
    if (BIG_GAMES.includes(node.type)) mult = cfg().MARQUEE_BUCKS_MULT;
    base = Math.round(base * mult);
    marginB = Math.round(marginB * mult);
    const logo = has(run, 'logo') ? 15 : 0;
    const rw = { base, margin: marginB, logo, bucks: base + marginB + logo, marginPts: margin, packs: [], item: null, stats: null, statTaken: false, score: `${c.you}-${c.opp}` };

    if (node.type === 'game') rw.packs.push({ type: 'base', opened: false });
    if (node.type === 'rivalry') {
      rw.packs.push({ type: 'team', theme: U.pick(Object.keys(F.THEMES)), opened: false });
      const avail = F.Run.availableMemorabilia(run);
      if (avail.length) rw.item = U.pick(avail);
    }
    if (node.type === 'boss' || node.type === 'playoff') {
      rw.packs.push({ type: 'legends', opened: false });
      // Pick one of 3 random stats (Marquee and Playoff wins: see MARQUEE_STAT_GAIN / PLAYOFF_STAT_GAIN)
      const n = node.type === 'boss' ? cfg().MARQUEE_STAT_GAIN : cfg().PLAYOFF_STAT_GAIN;
      const open = F.STATS.map(s => s.key).filter(k => run.stats[k] < cfg().STAT_MAX); // maxed stats aren't offered
      rw.stats = open.length ? U.shuffle(open).slice(0, 3).map(k => ({ stat: k, n })) : null;
    }
    return rw;
  };

  C.lossStamina = c => Math.max(1, Math.round((c.opp - c.you) * cfg().LOSS_STAMINA_PER_POINT));

  F.Combat = C;
})(FCD);
