// ============================================================
// CARDS
// Every card in the game is defined here.
//
//   type:   shot | defense | play | auto | status
//   stat:   which Rookie Card stat boosts it (see config.js STATS)
//           No card uses STA: Stamina is only the player's health bar.
//   cost:   Energy cost
//   base:   the card's main number before stat and serial bonuses
//   scale:  how much stat/serial bonuses count (1 = full, 0.5 = half)
//   pool:   where it can be found
//           base = regular packs,
//           showtime = Showtime insert, auto = Autographs (bonus hits),
//           starter = starting decks only, status = junk cards
//   rarity: common | uncommon | rare (how often it shows up in packs)
//   text:   {v} is replaced by the card's real number
// ============================================================
(function (F) {
  const CARDS = {};
  function card(id, def) {
    def.id = id;
    def.tags = def.tags || [];
    if (def.scale == null) def.scale = 1;
    if (def.levels) { def.base = def.levels.find(Boolean).base; def.cost = def.levels.find(Boolean).cost; }
    CARDS[id] = def;
  }

  // Hand-tuned numbers for each serial tier, in order:
  //   Base, /500, /250, /99, /25, /10, 1/1   (Showtime cards start at /99: pass from = 3)
  //   bases: the card's number BEFORE the stat bonus (the stat bonus is still added on top)
  //   costs: Energy cost at that tier (used exactly, no automatic discounts)
  //   extra: other per-tier numbers, e.g. { x: [...] } fills in {x} in the text
  // Tiers not listed fall back to the Base level plus the normal serial bonus.
  function lv(bases, costs, extra = {}, from = 0) {
    const out = [];
    bases.forEach((b, i) => {
      const o = { base: b, cost: costs[i] };
      Object.keys(extra).forEach(k => { o[k] = extra[k][i]; });
      out[from + i] = o;
    });
    return out;
  }
  const same = (n, value) => Array(n).fill(value);

  // ---------------- SHOTS (shown as "Scoring") ----------------
  // Rebalanced numbers: the value shown = base + stat bonus. Starting stats are always +0,
  // so at the start of a season the King sees exactly these numbers.
  card('corner_three', { name: 'Corner Three', type: 'shot', stat: 'SHO', tags: ['three'], pool: 'base', rarity: 'common', text: 'Score {v}.',
    levels: lv([4, 5, 6, 7, 8, 9, 10], [1, 1, 1, 1, 1, 1, 0]) });
  card('step_back', { name: 'Step-Back Three', type: 'shot', stat: 'SHO', tags: ['three'], pool: 'base', rarity: 'uncommon', text: 'Score {v}.',
    levels: lv([9, 10, 11, 12, 12, 13, 15], [2, 2, 2, 2, 1, 1, 1]) });
  card('pull_up', { name: 'Pull-Up Jumper', type: 'shot', stat: 'SHO', tags: ['mid'], pool: 'base', rarity: 'common', text: 'Score {v}.',
    levels: lv([4, 5, 6, 7, 8, 9, 10], [1, 1, 1, 1, 1, 1, 0]) });
  card('fadeaway', { name: 'Fadeaway', type: 'shot', stat: 'SHO', tags: ['mid'], ignoreDefense: true, pool: 'base', rarity: 'uncommon', text: 'Score {v}. Ignores Defense.',
    levels: lv([6, 7, 8, 9, 9, 10, 12], [2, 2, 2, 2, 1, 1, 1]) });
  card('floater', { name: 'Floater', type: 'shot', stat: 'SHO', tags: ['mid'], pool: 'base', rarity: 'common', text: 'Score {v}. Draw 1.', effect: g => g.draw(1),
    levels: lv([5, 6, 7, 8, 9, 10, 10], [1, 1, 1, 1, 1, 1, 0]) });
  card('layup', { name: 'Layup', type: 'shot', stat: 'FIN', pool: 'base', rarity: 'common', text: 'Score {v}.',
    levels: lv([3, 5, 6, 7, 8, 9, 14], same(7, 1)) });
  card('driving_dunk', { name: 'Driving Dunk', type: 'shot', stat: 'FIN', pool: 'base', rarity: 'common', text: 'Score {v}.',
    levels: lv([8, 9, 10, 11, 13, 15, 20], same(7, 2)) });
  card('alley_oop', { name: 'Alley-Oop', type: 'shot', stat: 'FIN', pool: 'base', rarity: 'uncommon', text: 'Score {v}. +{x} if you have Momentum.',
    bonus: (c, l) => (c.momentum > 0 ? l.x : 0),
    levels: lv([3, 4, 5, 6, 7, 8, 10], [1, 1, 1, 1, 1, 1, 0], { x: [4, 4, 4, 4, 4, 5, 5] }) });
  card('posterizer', { name: 'Posterizer', type: 'shot', stat: 'FIN', exhaust: true, pool: 'base', rarity: 'rare', text: 'Score {v}. Momentum counts {x}. Exhaust.',
    levels: lv([6, 8, 10, 12, 14, 14, 14], same(7, 2), { mm: [2, 2, 2, 2, 2, 2, 3], x: ['double', 'double', 'double', 'double', 'double', 'double', 'triple'] }) });
  card('and_one', { name: 'And-One', type: 'shot', stat: 'FIN', pool: 'base', rarity: 'uncommon', text: 'Score {v}. Gain {x} Energy.', effect: (g, v, l) => g.energy(l.x),
    levels: lv([5, 6, 7, 8, 9, 10, 12], [2, 2, 2, 2, 2, 2, 1], { x: [1, 1, 1, 1, 2, 2, 1] }) });
  card('fast_break', { name: 'Fast Break', type: 'shot', stat: 'FIN', pool: 'base', rarity: 'common', text: 'Score {v}.', effect: (g, v, l) => { if (l.x) g.momentum(l.x); },
    levels: lv([1, 2, 3, 4, 5, 5, 7], same(7, 0), { x: [0, 0, 0, 0, 0, 2, 2], text: [null, null, null, null, null, 'Score {v}. Then gain {x} Momentum.', 'Score {v}. Then gain {x} Momentum.'] }) });
  card('putback', { name: 'Putback', type: 'shot', stat: 'REB', pool: 'base', rarity: 'uncommon', text: 'Score {v}. +{x} if you already shot this turn.',
    bonus: (c, l) => (c.shotsThisTurn > 0 ? l.x : 0),
    levels: lv([2, 3, 4, 5, 6, 7, 7], [1, 1, 1, 1, 1, 1, 0], { x: [3, 3, 3, 4, 4, 4, 4] }) });
  card('sky_hook', { name: 'Sky Hook', type: 'shot', stat: 'SHO', tags: ['mid'], ignoreDefense: true, pool: 'base', rarity: 'uncommon', text: 'Score {v}. Ignores Defense.',
    levels: lv([6, 7, 8, 9, 9, 10, 12], [2, 2, 2, 2, 1, 1, 1]) });
  card('granny_shot', { name: 'Granny Free Throw', type: 'shot', stat: 'SHO', tags: ['mid'], ignoreDefense: true, pool: 'base', rarity: 'common', text: 'Score {v}. Ignores Defense. Draw {x}.', effect: (g, v, l) => g.draw(l.x),
    levels: lv([1, 2, 3, 4, 5, 5, 7], same(7, 0), { x: [1, 1, 1, 1, 1, 2, 2] }) });

  // ---------------- DEFENSE ----------------
  // Rebalanced numbers (starting stats are +0, so these are the values at the start of a season).
  card('contest', { name: 'Contest', type: 'defense', stat: 'BLK', pool: 'base', rarity: 'common', text: 'Gain {v} Defense.',
    levels: lv([7, 8, 9, 10, 12, 14, 17], same(7, 1)) });
  card('swipe', { name: 'Swipe', type: 'defense', stat: 'STL', pool: 'base', rarity: 'common', text: 'Gain {v} Defense. Draw 1.', effect: g => g.draw(1),
    levels: lv([6, 7, 8, 9, 10, 12, 14], same(7, 1)) });
  card('box_out', { name: 'Box Out', type: 'defense', stat: 'REB', pool: 'base', rarity: 'common', text: 'Gain {v} Defense. Gain {x} Momentum.', effect: (g, v, l) => g.momentum(l.x),
    levels: lv([6, 7, 8, 9, 10, 11, 13], same(7, 1), { x: [2, 2, 2, 2, 3, 3, 5] }) });
  card('lockdown', { name: 'Lockdown', type: 'defense', stat: 'STL', pool: 'base', rarity: 'uncommon', text: 'Gain {v} Defense. Their next play scores half.', effect: g => g.half(),
    levels: lv([3, 4, 5, 6, 7, 8, 10], same(7, 1)) });
  card('block_party', { name: 'Block Party', type: 'defense', stat: 'BLK', pool: 'base', rarity: 'uncommon', text: 'Gain {v} Defense.',
    levels: lv([14, 15, 16, 17, 18, 20, 22], same(7, 2)) });
  card('take_charge', { name: 'Take the Charge', type: 'defense', stat: 'BLK', pool: 'base', rarity: 'uncommon', text: 'Gain {v} Defense. Gain {x} Momentum.', effect: (g, v, l) => g.momentum(l.x),
    levels: lv([4, 5, 6, 7, 8, 9, 11], same(7, 0), { x: [1, 1, 1, 2, 2, 2, 4] }) });
  card('full_court_press', { name: 'Full-Court Press', type: 'defense', stat: 'STL', pool: 'base', rarity: 'rare', text: "Gain {v} Defense. Remove the opponent's Defense.", effect: g => g.stripDefense(),
    levels: lv([6, 7, 8, 9, 10, 12, 12], [2, 2, 2, 2, 2, 2, 1]) });

  // ---------------- PLAYMAKING ----------------
  // Momentum cards count half the stat bonus, rounded.
  card('no_look', { name: 'No-Look Pass', type: 'play', stat: 'PAS', scale: 0.5, pool: 'base', rarity: 'common', text: 'All scoring cards this turn gain +{v} value.', effect: (g, v) => g.turnShotBonus(v),
    levels: lv([1, 2, 3, 4, 5, 6, 9], same(7, 0)) });
  card('bounce_pass', { name: 'Bounce Pass', type: 'play', stat: 'PAS', scale: 0.5, pool: 'base', rarity: 'common', text: 'Gain {v} Momentum. Draw {x}.', effect: (g, v, l) => { g.momentum(v); g.draw(l.x); },
    levels: lv([3, 4, 5, 6, 6, 7, 9], same(7, 1), { x: [1, 1, 1, 2, 2, 2, 2] }) });
  card('behind_back', { name: 'Behind the Back', type: 'play', stat: 'HDL', scale: 0.34, pool: 'base', rarity: 'common', text: 'Draw {v}. Gain {x} Momentum.', effect: (g, v, l) => { g.draw(v); g.momentum(l.x); },
    levels: lv([1, 1, 1, 2, 2, 3, 4], same(7, 0), { x: [1, 2, 3, 3, 4, 5, 5] }) });
  card('hustle', { name: 'Hustle Play', type: 'play', stat: 'HDL', scale: 0.5, pool: 'base', rarity: 'common', text: 'Gain {v} Momentum. Gain {x} Energy next turn.', effect: (g, v, l) => { g.momentum(v); g.energyNext(l.x); },
    levels: lv([4, 5, 6, 7, 8, 9, 10], same(7, 1), { x: [1, 1, 1, 1, 1, 1, 2] }) });
  card('pick_roll', { name: 'Pick and Roll', type: 'play', stat: 'PAS', scale: 0.5, pool: 'base', rarity: 'uncommon', text: 'Gain {v} Momentum and {x} Defense.', effect: (g, v, l) => { g.momentum(v); g.defense(l.x); },
    levels: lv([3, 4, 5, 5, 6, 7, 7], same(7, 1), { x: [4, 5, 5, 6, 7, 8, 10] }) });
  card('iso', { name: 'Isolation', type: 'play', stat: 'HDL', pool: 'base', rarity: 'uncommon', text: 'Double your next scoring card value this turn. Gain {x} Momentum.', effect: (g, v, l) => { g.doubleNext(); if (l.x) g.momentum(l.x); },
    levels: lv(same(7, null), [2, 2, 1, 1, 1, 1, 1], { x: [0, 2, 2, 4, 5, 6, 8], text: ['Double your next scoring card value this turn.', null, null, null, null, null, null] }) });
  card('short_shorts', { name: 'Short Shorts', type: 'play', stat: 'HDL', exhaust: true, pool: 'base', rarity: 'uncommon', text: 'Gain 1 Energy. Exhaust. Gain {x} Momentum.', effect: (g, v, l) => { g.energy(1); if (l.x) g.momentum(l.x); },
    levels: lv(same(7, null), same(7, 0), { x: [0, 2, 3, 4, 5, 6, 8], text: ['Gain 1 Energy. Exhaust.', null, null, null, null, null, null] }) });

  // ---------------- AUTOGRAPHS ----------------
  // Played like normal cards. The boost lasts the rest of the game,
  // then the card comes back for the next game.
  // Rebalanced numbers (starting stats are +0; gained stats count at the card's scale, rounded).
  // Autographs only come in /250 and better (from = 2)
  card('auto_sharp', { name: 'Signed Sharpshooter', type: 'auto', stat: 'SHO', scale: 0.5, pool: 'auto', text: 'Rest of game: Shooting cards score +{v}.', effect: (g, v) => g.buff('sho', v),
    levels: lv([2, 3, 4, 5, 5], [2, 2, 2, 2, 1], {}, 2) });
  card('auto_floor', { name: 'Signed Floor General', type: 'auto', stat: 'PAS', scale: 0.34, pool: 'auto', text: 'Rest of game: gain {v} Momentum at the start of each turn.', effect: (g, v) => g.buff('momentumPerTurn', v),
    levels: lv([4, 5, 6, 8, 8], [2, 2, 2, 2, 1], {}, 2) });
  card('auto_lock', { name: 'Signed Lockdown Defender', type: 'auto', stat: 'BLK', scale: 0.5, pool: 'auto', text: 'Rest of game: gain {v} Defense at the start of each turn.', effect: (g, v) => g.buff('defensePerTurn', v),
    levels: lv([4, 5, 6, 8, 8], [2, 2, 2, 2, 1], {}, 2) });
  card('auto_iron', { name: 'Signed Iron Man', type: 'auto', stat: 'HDL', pool: 'auto', text: 'Rest of game: draw 1 extra card each turn. Gain {x} Momentum.', effect: (g, v, l) => { g.buff('extraDraw', 1); if (l.x) g.momentum(l.x); },
    levels: lv(same(5, null), [2, 2, 2, 2, 1], { x: [1, 3, 5, 7, 7] }, 2) });
  card('auto_high', { name: 'Signed High Flyer', type: 'auto', stat: 'FIN', scale: 0.5, pool: 'auto', text: 'Rest of game: Finishing cards score +{v}.', effect: (g, v) => g.buff('fin', v),
    levels: lv([2, 3, 4, 5, 5], [2, 2, 2, 2, 1], {}, 2) });
  card('auto_closer', { name: 'Signed Closer', type: 'auto', stat: 'SHO', scale: 0.5, pool: 'auto', text: 'Rest of game: your first shot each turn scores +{v}.', effect: (g, v) => g.buff('firstShot', v),
    levels: lv([3, 4, 5, 6, 8], same(5, 1), {}, 2) });

  // ---------------- SHOWTIME INSERT (/99, /25, /10, 1/1 only) ----------------
  card('st_heave', { name: 'Half-Court Heave', type: 'shot', stat: 'SHO', tags: ['three'], exhaust: true, pool: 'showtime', text: 'Score {v}. Exhaust.',
    levels: lv([14, 16, 18, 22], same(4, 1), {}, 3) });
  card('st_windmill', { name: 'Windmill Jam', type: 'shot', stat: 'FIN', pool: 'showtime', text: 'Score {v}. Then gain {x} Momentum.', effect: (g, v, l) => g.momentum(l.x),
    levels: lv([13, 14, 15, 19], [2, 1, 1, 1], { x: [3, 3, 4, 5] }, 3) });
  card('st_ankle', { name: 'Ankle Breaker', type: 'play', stat: 'HDL', scale: 0.5, pool: 'showtime', text: 'Gain 1 Energy. Draw {x}. Your next shot scores +{v}.', effect: (g, v, l) => { g.energy(1); g.draw(l.x); g.nextShot(v); },
    levels: lv([4, 5, 6, 6], same(4, 0), { x: [1, 1, 1, 2] }, 3) });
  card('st_chasedown', { name: 'Chase-Down Block', type: 'defense', stat: 'BLK', pool: 'showtime', text: 'Gain {v} Defense. Their next play scores half.', effect: g => g.half(),
    levels: lv([8, 10, 12, 14], same(4, 1), {}, 3) });
  card('st_dime', { name: 'Dime Time', type: 'play', stat: 'PAS', scale: 0.5, pool: 'showtime', text: 'Double your Momentum, then gain {v}.', effect: (g, v) => { g.doubleMomentum(); g.momentum(v); },
    levels: lv([2, 3, 3, 4], same(4, 0), {}, 3) });

  // ---------------- STARTER SIGNATURE CARDS ----------------
  // owner: which star's picture and autograph appear on the card
  // Signature cards are upgraded from Base up to /10 (no 1 of 1)
  card('king_coast', { name: 'Coast to Coast', type: 'shot', stat: 'FIN', pool: 'starter', owner: 'king', text: 'Score {v}. Gain {x} Defense.', effect: (g, v, l) => g.defense(l.x),
    levels: lv([7, 7, 8, 8, 9, 11], same(6, 2), { x: [8, 9, 9, 10, 10, 11] }) });
  card('chef_special', { name: "Chef's Special", type: 'shot', stat: 'SHO', tags: ['three'], extraHeat: 1, pool: 'starter', owner: 'chef', text: 'Score {v}. Gain 1 extra Heat.',
    levels: lv([6, 7, 8, 9, 10, 12], same(6, 1)) });

  // ---------------- STATUS (junk) ----------------
  card('tired_legs', { name: 'Tired Legs', type: 'status', stat: null, cost: 0, base: null, unplayable: true, pool: 'status', text: 'Unplayable. Takes up space in your hand.' });

  F.CARDS = CARDS;

  // Starting decks: 10 cards each, including the star's signature card.
  // Energy: one 0-cost card, one 2-cost card, eight 1-cost cards.
  F.STARTING_DECKS = {
    // 4 Scoring, 4 Defense, 2 Playmaking. Coast to Coast is the 2-cost card, No-Look Pass the 0-cost.
    king: ['king_coast', 'layup', 'layup', 'pull_up', 'contest', 'contest', 'contest', 'box_out', 'no_look', 'bounce_pass'],
    // 5 Scoring, 3 Defense, 2 Playmaking. Step-Back Three is the 2-cost card, No-Look Pass the 0-cost.
    chef: ['chef_special', 'corner_three', 'layup', 'pull_up', 'step_back', 'contest', 'contest', 'swipe', 'no_look', 'bounce_pass'],
  };

  F.TYPE_LABELS = { shot: 'Scoring', defense: 'Defense', play: 'Playmaking', auto: 'Autograph', status: 'Status' };
})(FCD);
