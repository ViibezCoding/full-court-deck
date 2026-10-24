// The game screen: scoreboard, your side, their next play, and your hand.
(function (F) {
  const V = F.V;
  const S = F.Screens;
  const A = F.Actions;
  const UI = F.UI;
  const esc = s => F.U.esc(s);

  const KIND = { game: 'Regular Season', rivalry: 'Rivalry Game', boss: 'Marquee Game', playoff: 'Playoffs', finals: 'The Finals' };

  // Scale the game board so it fills about this much of the window's height
  const FIT_HEIGHT = 0.9; // the measured box includes some empty space under the cards, so this lands the cards at ~80%
  const MAX_ZOOM = 1.8;
  UI.fitCombat = () => {
    const court = document.querySelector('#app .court');
    if (!court) return;
    court.style.zoom = 1;
    const r = court.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const byHeight = (window.innerHeight * FIT_HEIGHT - top) / r.height;
    const byWidth = (document.documentElement.clientWidth - 8) / r.width;
    const z = Math.max(1, Math.min(MAX_ZOOM, byHeight, byWidth));
    court.style.zoom = z.toFixed(3);
  };
  let fitTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(() => { if (UI.screen === 'combat') UI.fitCombat(); }, 80);
  });

  function intentBlock(c) {
    const it = c.intent;
    const p = F.Combat.intentPreview(c);
    let num = '';
    let extra = '';
    let note = '';
    switch (it.kind) {
      case 'score': num = `${p.raw} pts`; break;
      case 'scoreDefend': num = `${p.raw} pts`; extra = `+ ${it.def} Defense`; break;
      case 'defend': num = `+${it.def} Defense`; note = 'Their Defense will absorb your shots next possession.'; break;
      case 'buff': num = `+${it.buff}`; note = 'All of their future plays will score more.'; break;
    }
    if (it.pts != null) {
      if (c.defense > 0) note = p.after === 0 ? 'Your Defense stops all of it.' : `Your Defense cuts it to ${p.after}.`;
      else note = 'Play Defense cards to stop it.';
      if (c.halfNext) note = `Halved by your Lockdown. ${note}`;
    }
    return `<div class="intent kind-${it.kind}">
      <div class="it-label">Their next play</div>
      <div class="it-name">${esc(it.name)}</div>
      <div class="it-num">${num}</div>
      ${extra ? `<div class="it-extra">${extra}</div>` : ''}
      <div class="it-note">${note}</div>
    </div>`;
  }

  function chip(cls, label, value, title) {
    return `<div class="chip ${cls} ${value ? '' : 'zero'}" ${title ? `title="${esc(title)}"` : ''}><small>${label}</small><b>${value}</b></div>`;
  }

  S.combat = () => {
    const run = F.run;
    const c = F.combat;
    const ch = F.CHARACTERS[run.charId];
    const node = UI.node;
    const fx = c.fx;
    c.fx = [];
    const fresh = UI.lastTurn !== c.turn;
    UI.lastTurn = c.turn;

    const pop = side => fx.filter(f => f.kind === 'score' && f.side === side)
      .map(f => `<span class="pop ${f.blocked ? 'blocked' : ''}">${f.blocked ? 'BLOCKED' : `+${f.pts}`}</span>`).join('');
    const versFx = fx.some(f => f.kind === 'versatility') ? '<span class="pop vers-pop">Versatility! +1 Energy next turn</span>' : '';

    let kind = KIND[c.nodeType];
    if (c.nodeType === 'playoff') kind = F.TEAMS.playoffs[node.round].round;
    if (c.nodeType === 'finals') kind = `The Finals · Game ${run.finals.w + run.finals.l + 1} · Series ${run.finals.w}-${run.finals.l}`;

    const orbs = [];
    const orbCount = Math.max(c.energy, c.maxEnergy);
    for (let i = 0; i < orbCount; i++) orbs.push(`<i class="orb ${i < c.energy ? 'on' : ''}"></i>`);

    let sig = '';
    if (run.charId === 'chef') sig = chip('heat', 'Heat', c.heat, `Added to every Shooting card (max ${F.CONFIG.HEAT_MAX}). Play ${F.CONFIG.HEAT_SHOTS} scoring cards in a turn for +1. Resets to 0 on a turn with fewer than ${F.CONFIG.HEAT_SHOTS}.`);
    if (run.charId === 'king') {
      const t = c.typesPlayed;
      sig = `<div class="chip vers-chip ${c.versatilityDone ? 'done' : ''}" title="Play a Scoring, Defense and Playmaking card this turn for +1 Energy next turn"><small>Versatility</small>
        <div class="vers"><span class="${t.shot ? 'on' : ''}">Score</span><span class="${t.defense ? 'on' : ''}">Def</span><span class="${t.play ? 'on' : ''}">Play</span></div></div>`;
    }

    const actives = c.active.length || c.pendingActive.length
      ? `<div class="actives"><small>Active Autographs</small>${c.active.concat(c.pendingActive).map(card => {
        // Hover (or keyboard focus) shows what the Autograph does, with its real number
        const v = F.Combat.cardValue(run, null, card);
        const pending = c.pendingActive.includes(card);
        const desc = F.Combat.cardText(card).replace('{v}', v == null ? '' : v) + (pending ? ' (Starts next turn.)' : '');
        return `<span class="active-chip${pending ? ' pending' : ''}" tabindex="0" aria-label="${esc(F.CARDS[card.id].name)}: ${esc(desc)}">${esc(F.CARDS[card.id].name)}${pending ? ' <em>(next turn)</em>' : ''}
          <span class="active-pop" aria-hidden="true"><b>${esc(F.CARDS[card.id].name)}</b><em>${F.TIERS[card.tier].label}</em>${esc(desc)}</span></span>`;
      }).join('')}</div>`
      : '';

    const hand = c.hand.map((card, i) => V.card(run, card, {
      tag: 'button',
      combat: c,
      cls: F.Combat.canPlay(run, c, card) ? '' : 'unaff',
      attrs: `data-action="play" data-i="${i}" style="--i:${i}" title="Press ${i + 1} to play"`,
    })).join('');

    let banner = '';
    if (c.over) {
      const win = c.over === 'win';
      let msg;
      const loss = F.Combat.lossStamina(c);
      if (win) msg = `You won by ${c.you - c.opp}.`;
      else if (c.knockout) msg = 'You ran out of Stamina. Your season is over.';
      else if (c.nodeType === 'playoff') msg = 'Eliminated from the playoffs. Your season is over.';
      else if (c.nodeType === 'finals') msg = run.finals.l + 1 >= 2 ? 'The Superteam wins the series.' : 'You lost this one. The series continues.';
      else msg = `You lose ${loss} Stamina (the margin of defeat).${run.stamina - loss <= 0 ? ' That ends your season.' : ''}`;
      banner = `<div class="final"><div class="final-card ${win ? 'win' : 'loss'}">
        <div class="eyebrow">Final · ${esc(c.team.name)}</div>
        <div class="final-score">${win ? 'W' : 'L'} ${c.you}-${c.opp}</div>
        <p>${msg}</p>
        <button class="btn primary" data-action="finishGame">${win && c.nodeType !== 'finals' ? 'Collect rewards' : 'Continue'}</button>
      </div></div>`;
    }

    return `${headerLite(run)}<main class="court">
      <section class="scoreboard">
        <div class="sb-side you">
          <div class="sb-team">${esc(ch.name)}</div>
          <div class="sb-score">${c.you}${pop('you')}</div>
          <div class="sb-bar"><i style="width:${Math.min(100, (c.you / c.target) * 100)}%"></i></div>
        </div>
        <div class="sb-mid">
          <div class="eyebrow">${esc(kind)}</div>
          <div class="sb-target">First to ${c.target}</div>
          <div class="sb-poss">Possession ${c.turn}</div>
        </div>
        <div class="sb-side opp">
          <div class="sb-team">${esc(c.team.name)}</div>
          <div class="sb-score">${pop('opp')}${c.opp}</div>
          <div class="sb-bar"><i style="width:${Math.min(100, (c.opp / c.target) * 100)}%"></i></div>
        </div>
      </section>

      <section class="floor">
        <div class="panel you-panel">
          <div class="energy"><small>Energy</small><div class="orbs">${orbs.join('')}</div><b>${c.energy}</b>${versFx}</div>
          <div class="chips">
            ${chip('def', 'Defense', c.defense, 'Blocks their next play')}
            ${chip('mom', 'Momentum', c.momentum, 'Added to your next shot, then resets. Unused Momentum is halved at the end of your turn.')}
            ${sig}
            ${c.nextShotBonus ? chip('nsb', 'Next shot', `+${c.nextShotBonus}`) : ''}
            ${c.turnShotBonus ? chip('nsb', 'This turn', `+${c.turnShotBonus}`, 'No-Look Pass: every scoring card this turn gains this much value') : ''}
            ${c.doubleNext ? chip('nsb', 'Next shot', '×2', 'Isolation: your next Scoring card value this turn is doubled') : ''}
            ${c.bonusEnergyNext ? chip('nen', 'Next turn', `+${c.bonusEnergyNext} E`) : ''}
          </div>
          ${actives}
        </div>
        <div class="log" aria-live="polite">${c.log.slice(-6).map(l => `<p>${esc(l)}</p>`).join('') || '<p>Click a card to play it, or press its number key. Press E to end your turn.</p>'}</div>
        <div class="panel opp-panel">
          ${intentBlock(c)}
          <div class="chips">
            ${chip('odef', 'Their Defense', c.oppDefense, 'Absorbs your shots this possession')}
            ${c.oppBuff ? chip('obuff', 'Their bonus', `+${c.oppBuff}`, 'Added to all of their plays') : ''}
          </div>
        </div>
      </section>

      <section class="bench">
        <button class="pile" data-action="viewPile" data-pile="draw"><small>Draw pile</small><b>${c.draw.length}</b></button>
        <div class="hand ${fresh ? 'fresh' : ''}">${hand || '<p class="fine">No cards in hand.</p>'}</div>
        <div class="bench-right">
          <button class="pile" data-action="viewPile" data-pile="discard"><small>Discard</small><b>${c.discard.length}</b></button>
          <button class="btn primary end" data-action="endTurn" ${c.over ? 'disabled' : ''}>End turn <small>E</small></button>
        </div>
      </section>
      ${banner}
    </main>`;
  };

  // Slim header for the game screen
  function headerLite(run) {
    const pct = Math.round((run.stamina / run.maxStamina) * 100);
    return `<header class="hud lite">
      <button class="hud-char" data-action="viewRookie" title="View your Rookie Card">
        <span class="hc-face" style="--trim:${F.CHARACTERS[run.charId].colors.trim}">${V.playerPortrait(F.CHARACTERS[run.charId])}</span>
        <span class="hc-txt"><b>${esc(F.CHARACTERS[run.charId].name)}</b><small>Rookie Card</small></span>
      </button>
      <div class="hud-stam ${run.act >= 6 ? 'off' : pct < 30 ? 'low' : ''}" ${run.act >= 6 ? 'title="Stamina is not used in the Playoffs or Finals"' : ''}>
        <div class="hs-top"><small>${run.act >= 6 ? 'Stamina · off' : 'Stamina'}</small><b>${run.stamina}/${run.maxStamina}</b></div>
        <div class="hs-bar"><i style="width:${pct}%"></i></div>
      </div>
      <div class="hud-cell"><small>${F.MONTHS[run.act]}</small><b>${run.record.w}-${run.record.l}</b></div>
      <div class="hud-memo"><small>Memorabilia</small><div class="memo-row">${run.memorabilia.length ? run.memorabilia.map(id => V.memo(id)).join('') : '<span class="none">None yet</span>'}</div></div>
      <span class="hud-timer" title="Season time (pauses when you leave the season or switch tabs)"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 6v3.2l2 1.3M6.5 1.8h3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><b>${F.Records.fmt(run.playMs)}</b></span>
      <button class="btn small hud-deck" data-action="viewDeck">Deck <b>${run.deck.length}</b></button>
      ${V.soundButton()}
      <button class="btn small ghost" data-action="toTitle" title="Your season is saved. This game restarts from the map.">Menu</button>
    </header>`;
  }

  // Buzzer, then a fanfare and crowd for a win or a sad trombone for a loss
  function gameEndSound(c) {
    F.Audio.sfx('buzzer');
    if (c.over === 'win') { F.Audio.sfx('win', 1.0); F.Audio.sfx('crowd', 1.1); }
    else F.Audio.sfx('loss', 1.0);
  }

  A.play = data => {
    const c = F.combat;
    const card = c.hand[+data.i];
    const ok = F.Combat.play(F.run, c, +data.i);
    if (!ok) {
      if (card && F.CARDS[card.id].unplayable) UI.toast('That card cannot be played.');
      else if (card) UI.toast('Not enough Energy.');
      return;
    }
    // Sound for the card that was just played
    const def = F.CARDS[card.id];
    const shot = c.fx.find(f => f.kind === 'score' && f.side === 'you');
    if (shot) {
      if (shot.blocked) F.Audio.sfx('block');
      else if (def.tags.includes('three') || shot.pts >= 12) F.Audio.sfx('three');
      else F.Audio.sfx('swish');
    } else if (def.type === 'play') F.Audio.sfx('dribble');
    else F.Audio.sfx('cardPlay');
    if (c.over) gameEndSound(c);
    F.Save.saveRun(F.run);
    UI.render();
  };

  A.endTurn = () => {
    const c = F.combat;
    F.Combat.endTurn(F.run, c);
    if (c.over) gameEndSound(c);
    else F.Audio.sfx('dribble');
    F.Save.saveRun(F.run);
    UI.render();
  };

  F.Overlays.pile = o => {
    const c = F.combat;
    const list = o.pile === 'draw' ? c.draw : c.discard;
    const sorted = list.slice().sort((a, b) => F.CARDS[a.id].name.localeCompare(F.CARDS[b.id].name));
    return `<div class="ov"><div class="ov-panel">
      <div class="ov-head"><div><div class="eyebrow">${list.length} cards${o.pile === 'draw' ? ' · shown in A to Z order, not draw order' : ''}</div><h2>${o.pile === 'draw' ? 'Draw pile' : 'Discard pile'}</h2></div><button class="btn" data-action="closeOverlay">Close</button></div>
      <div class="deck-grid">${sorted.map(card => V.card(F.run, card)).join('') || '<p class="fine">Empty.</p>'}</div>
    </div></div>`;
  };

  A.viewPile = d => UI.open('pile', { pile: d.pile });
})(FCD);
