// Screens (title, map, shop, rewards ...) and what every button does.
(function (F) {
  const V = F.V;
  const U = F.U;
  const esc = s => U.esc(s);
  const cfg = () => F.CONFIG;

  const UI = (F.UI = { screen: 'title', ctx: {}, overlay: null, node: null, dev: false, lastTurn: 0 });
  const S = (F.Screens = {});
  const OV = (F.Overlays = {});
  const A = (F.Actions = {});

  // ================= Core rendering =================
  UI.go = (screen, ctx) => {
    UI.screen = screen;
    UI.ctx = ctx || {};
    UI.render();
    if (screen !== 'map') window.scrollTo(0, 0);
  };

  UI.render = () => {
    const app = document.getElementById('app');
    app.innerHTML = S[UI.screen](UI.ctx);
    app.dataset.screen = UI.screen;
    if (UI.screen === 'combat' && UI.fitCombat) UI.fitCombat();
    UI.renderOverlay();
    UI.renderDev();
  };

  UI.renderOverlay = () => {
    const el = document.getElementById('overlay');
    if (!UI.overlay) { el.innerHTML = ''; el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = OV[UI.overlay.kind](UI.overlay);
  };

  UI.open = (kind, data) => { UI.overlay = { kind, ...(data || {}) }; UI.render(); };
  UI.close = () => { UI.overlay = null; UI.render(); };

  let toastTimer = null;
  UI.toast = text => {
    const el = document.getElementById('toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  };

  const save = () => { if (F.run) F.Save.saveRun(F.run); };

  // ================= Shared pieces =================
  function hud() {
    const run = F.run;
    const ch = F.CHARACTERS[run.charId];
    const pct = Math.round((run.stamina / run.maxStamina) * 100);
    const phase = run.act < 6 ? 'Regular Season' : run.act === 6 ? 'Playoffs' : 'The Finals';
    return `<header class="hud">
      <button class="hud-char" data-action="viewRookie" title="View your Rookie Card">
        <span class="hc-face" style="--trim:${ch.colors.trim}">${V.playerPortrait(ch)}</span>
        <span class="hc-txt"><b>${esc(ch.name)}</b><small>Rookie Card</small></span>
      </button>
      <div class="hud-stam ${run.act >= 6 ? 'off' : pct < 30 ? 'low' : ''}" ${run.act >= 6 ? 'title="Stamina is not used in the Playoffs or Finals"' : ''}>
        <div class="hs-top"><small>${run.act >= 6 ? 'Stamina · off' : 'Stamina'}</small><b>${run.stamina}/${run.maxStamina}</b></div>
        <div class="hs-bar"><i style="width:${pct}%"></i></div>
      </div>
      <div class="hud-cell"><small>${phase}</small><b>${F.MONTHS[run.act]}</b></div>
      <div class="hud-cell"><small>Record</small><b>${run.record.w}-${run.record.l}</b></div>
      <div class="hud-cell bucks"><small>Bucks</small><b>${run.bucks}</b></div>
      <div class="hud-memo"><small>Memorabilia</small><div class="memo-row">${run.memorabilia.length ? run.memorabilia.map(id => V.memo(id)).join('') : '<span class="none">None yet</span>'}</div></div>
      <span class="hud-timer" title="Season time (pauses when you leave the season or switch tabs)"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 6v3.2l2 1.3M6.5 1.8h3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><b>${F.Records.fmt(run.playMs)}</b></span>
      <button class="btn small hud-deck" data-action="viewDeck">Deck <b>${run.deck.length}</b></button>
      ${soundButton()}
      <button class="btn small ghost" data-action="toTitle" title="Your season is saved">Menu</button>
    </header>`;
  }

  // ================= Sound settings =================
  const SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  const SPEAKER_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function soundButton(cls = '') {
    const muted = F.Audio.settings.muted;
    return `<button class="btn small ghost sound-btn ${cls}" data-action="soundSettings" aria-label="Sound settings${muted ? ' (muted)' : ''}" title="Sound settings">${muted ? SPEAKER_OFF : SPEAKER}</button>`;
  }
  F.V.soundButton = soundButton;

  OV.sound = () => {
    const s = F.Audio.settings;
    return `<div class="ov"><div class="ov-panel sound-panel">
      <div class="ov-head"><div><div class="eyebrow">Settings</div><h2>Sound</h2></div><button class="btn" data-action="closeOverlay">Done</button></div>
      <label class="slider" for="music-vol"><span>Music</span><input id="music-vol" type="range" min="0" max="100" value="${Math.round(s.music * 100)}" data-audio="music"></label>
      <label class="slider" for="sfx-vol"><span>Sound effects</span><input id="sfx-vol" type="range" min="0" max="100" value="${Math.round(s.sfx * 100)}" data-audio="sfx"></label>
      <button class="btn ${s.muted ? 'primary' : ''}" data-action="toggleMute">${s.muted ? 'Sound is off. Turn it on' : 'Mute all sound'}</button>
      <p class="fine">Music starts after your first click. The current music and effects are placeholders made with code.</p>
    </div></div>`;
  };
  A.soundSettings = () => UI.open('sound');
  A.toggleMute = () => { F.Audio.set('muted', !F.Audio.settings.muted); UI.render(); };

  // ================= Title =================
  S.title = () => {
    const meta = F.Meta.data;
    const saved = F.Save.loadRun();
    return `<div class="title-screen">
      <div class="title-bg">${V.homeBackground()}</div>
      ${soundButton('title-sound')}
      <div class="title-inner">
        <div class="eyebrow">A basketball roguelike deck builder</div>
        <h1 class="logo"><span>Full Court</span><span>Deck</span></h1>
        <div class="menu">
          ${saved ? `<button class="btn primary big" data-action="continueRun">Continue season<small>${esc(F.CHARACTERS[saved.charId].name)} · ${F.MONTHS[saved.act]} · ${saved.record.w}-${saved.record.l} · ${F.Records.fmt(saved.playMs)}</small></button>` : ''}
          <button class="btn ${saved ? '' : 'primary'} big" data-action="newRun">New season</button>
          <button class="btn big" data-action="binder">Binder Collection<small>${Object.keys(F.CHARACTERS).reduce((s, id) => s + F.Binder.progress(meta, id).serialsHave, 0)} serials collected</small></button>
          <button class="btn big" data-action="hallOfFame">Hall of Fame<small>${Object.keys(F.CHARACTERS).reduce((s, id) => s + F.Records.forChar(meta, id).wins, 0)} championships</small></button>
          <button class="btn big" data-action="frontOffice">Front Office<small>${meta.rings} Rings to spend</small></button>
        </div>
        <p class="fine">Seasons played: ${meta.runs} · Championships: ${meta.titles}</p>
      </div>
      <p class="disclaimer">Full Court Deck is a fan-made parody game. All characters, teams and memorabilia are fictional. This game is not affiliated with, endorsed by, or connected to the NBA, any team, or any current or former player.</p>
    </div>`;
  };

  // ================= Character select =================
  S.select = () => {
    const saved = F.Save.loadRun();
    const card = id => {
      const ch = F.CHARACTERS[id];
      const deck = {};
      F.STARTING_DECKS[id].forEach(c => { deck[c] = (deck[c] || 0) + 1; });
      return `<article class="sel-card">
        ${V.rookieCard(id, null)}
        <div class="sel-info">
          <div><div class="eyebrow">${esc(ch.team)}</div><h2>${esc(ch.name)}</h2></div>
          <p>${esc(ch.blurb)}</p>
          <div class="mech"><b>${esc(ch.mechanic.name)}</b><span>${esc(ch.mechanic.text)}</span></div>
          ${V.statTable(ch.stats)}
          <div class="deck-chips">${Object.keys(deck).map(c => {
            // Hover shows the card, click enlarges it (same view as the Binder)
            const fakeRun = { charId: id, stats: { ...ch.stats }, memorabilia: [] };
            return `<button class="deck-chip" data-action="zoomStarter" data-id="${c}" data-char="${id}" data-n="${deck[c]}" aria-label="${esc(F.CARDS[c].name)}: click to enlarge">
              ${deck[c] > 1 ? `${deck[c]}x ` : ''}${esc(F.CARDS[c].name)}
              <span class="chip-pop" aria-hidden="true">${V.card(fakeRun, { id: c, tier: 0, serial: 1 })}</span>
            </button>`;
          }).join('')}</div>
          <button class="btn primary" data-action="selectChar" data-id="${id}">Draft ${esc(ch.name)}</button>
        </div>
      </article>`;
    };
    return `<main class="select-screen">
      <div class="sel-head"><button class="btn ghost small" data-action="toTitle">Back</button><div><div class="eyebrow">Start a new season</div><h2>Choose your star</h2></div></div>
      ${saved ? '<p class="warn">Starting a new season replaces the one you have saved.</p>' : ''}
      <div class="sel-grid">${card('king')}${card('chef')}</div>
      <p class="fine">The number next to each stat is the bonus it adds to matching cards. Stats grow during the season and reset when a new season starts.</p>
    </main>`;
  };

  // ================= Front Office (Rings) =================
  S.frontOffice = () => {
    const meta = F.Meta.data;
    return `<main class="center-screen fo">
      <div class="sel-head"><button class="btn ghost small" data-action="toTitle">Back</button><div><div class="eyebrow">Permanent upgrades</div><h2>Front Office</h2></div></div>
      <p class="rings-big"><b>${meta.rings}</b> Rings</p>
      <p class="fine">Earn ${cfg().RINGS_MAKE_PLAYOFFS} Ring for making the playoffs and ${cfg().RINGS_CHAMPIONSHIP} more for winning the Finals. Upgrades last forever.</p>
      <div class="fo-list">${F.UPGRADES.map(u => {
        const lvl = meta.upgrades[u.id] || 0;
        const maxed = lvl >= u.costs.length;
        const cost = maxed ? null : u.costs[lvl];
        return `<div class="fo-row">
          <div><h3>${esc(u.name)}</h3><p>${esc(u.text)}</p></div>
          <div class="fo-lvl">${u.costs.map((_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div>
          ${maxed ? '<span class="maxed">Maxed</span>' : `<button class="btn ${meta.rings >= cost ? 'primary' : ''}" data-action="buyUpgrade" data-id="${u.id}" ${meta.rings >= cost ? '' : 'disabled'}>${cost} Rings</button>`}
        </div>`;
      }).join('')}
      ${pedRow(meta)}</div>
    </main>`;
  };

  // Performance Enhancing Drugs: one row, with a section for each star
  function pedRow(meta) {
    const P = F.PED;
    const ids = Object.keys(F.CHARACTERS);
    const prices = ids.map(id => P.cost(meta, id)).filter(c => c != null);
    const cheapest = prices.length ? Math.min(...prices) : null;
    const sections = ids.map(id => {
      const ch = F.CHARACTERS[id];
      const lvl = P.level(meta, id);
      const boosts = (meta.ped && meta.ped[id]) || {};
      const list = F.STATS.filter(s => boosts[s.key]).map(s => `${s.key} +${boosts[s.key]}`).join(', ');
      return `<div class="ped-char">
        <b>${esc(ch.name)}</b>
        <div class="fo-lvl">${P.costs.map((_, i) => `<i class="${i < lvl ? 'on' : ''} ${i === P.costs.length - 1 ? 'last' : ''}"></i>`).join('')}</div>
        <small>${lvl >= P.costs.length ? 'Maxed' : `Level ${lvl}/${P.costs.length}`}${list ? ` · ${list}` : ''}</small>
      </div>`;
    }).join('');
    return `<div class="fo-row ped-row">
      <div><h3>${esc(P.name)}</h3><p>${esc(P.text)} Levels 1-8 cost 75 Rings, the final level costs 150.</p>
        <div class="ped-chars">${sections}</div></div>
      <div></div>
      ${cheapest == null ? '<span class="maxed">Maxed</span>' : `<button class="btn ${meta.rings >= cheapest ? 'primary' : ''}" data-action="pedOpen" ${meta.rings >= cheapest ? '' : 'disabled'}>${cheapest} Rings</button>`}
    </div>`;
  }

  // Popup: pick the star, then the stat
  OV.ped = () => {
    const meta = F.Meta.data;
    const P = F.PED;
    const o = UI.overlay;
    let body;
    if (!o.charId) {
      body = `<p class="fine">Which star is this for?</p><div class="ped-pick">${Object.keys(F.CHARACTERS).map(id => {
        const ch = F.CHARACTERS[id];
        const cost = P.cost(meta, id);
        const ok = cost != null && meta.rings >= cost;
        return `<button class="btn big ${ok ? 'primary' : ''}" data-action="pedChar" data-id="${id}" ${ok ? '' : 'disabled'}>${esc(ch.name)}
          <small>${cost == null ? 'Maxed' : `Level ${P.level(meta, id) + 1} · ${cost} Rings`}</small></button>`;
      }).join('')}</div>`;
    } else {
      const id = o.charId;
      const ch = F.CHARACTERS[id];
      const boosts = (meta.ped && meta.ped[id]) || {};
      const last = P.level(meta, id) === P.costs.length - 1;
      body = `<p class="fine">${last ? 'Final level: pick any stat.' : 'Pick a stat to boost by +1. Each stat can only be boosted once.'} Cost: ${P.cost(meta, id)} Rings.</p>
        <div class="ped-pick">${F.STATS.map(s => {
          const ok = P.canPick(meta, id, s.key);
          const cur = ch.stats[s.key] + (boosts[s.key] || 0);
          return `<button class="btn ${ok ? 'primary' : ''}" data-action="pedBuy" data-stat="${s.key}" ${ok ? '' : 'disabled'}>${esc(s.label)}
            <small>${ok ? `${cur} → ${cur + 1}` : `${cur} · boosted`}</small></button>`;
        }).join('')}</div>
        <button class="btn ghost small" data-action="pedBack">Back</button>`;
    }
    return `<div class="ov"><div class="ov-panel ped-panel">
      <div class="ov-head"><div><div class="eyebrow">Front Office · ${meta.rings} Rings</div><h2>${esc(P.name)}${o.charId ? `: ${esc(F.CHARACTERS[o.charId].name)}` : ''}</h2></div><button class="btn" data-action="closeOverlay">Close</button></div>
      ${body}
    </div></div>`;
  };
  A.pedOpen = () => { UI.overlay = { kind: 'ped', charId: null }; UI.render(); };
  A.pedChar = d => { UI.overlay.charId = d.id; UI.render(); };
  A.pedBack = () => { UI.overlay.charId = null; UI.render(); };
  A.pedBuy = d => {
    const meta = F.Meta.data;
    const id = UI.overlay.charId;
    if (!F.PED.buy(meta, id, d.stat)) return;
    F.Meta.save();
    UI.toast(`${F.CHARACTERS[id].name}: ${F.STATS.find(s => s.key === d.stat).label} +1 (permanent).`);
    UI.close();
  };

  // ================= Map =================
  S.map = () => {
    const run = F.run;
    const m = run.map;
    const avail = new Set(F.Map.available(run).map(n => n.id));
    const X = n => ((n.lane + 0.5) / m.lanes) * 100;
    const Y = n => 100 - ((n.row + 0.5) / m.rows) * 100;
    const walked = new Set();
    for (let i = 1; i < run.path.length; i++) walked.add(`${run.path[i - 1]}>${run.path[i]}`);
    const lines = m.edges.map(([a, b]) => {
      const na = F.Map.node(run, a);
      const nb = F.Map.node(run, b);
      let cls = '';
      if (walked.has(`${a}>${b}`)) cls = 'walked';
      else if (run.pos === a && avail.has(b)) cls = 'open';
      return `<line x1="${X(na)}" y1="${Y(na)}" x2="${X(nb)}" y2="${Y(nb)}" class="${cls}"/>`;
    }).join('');
    const nodes = m.nodes.map(n => {
      const state = n.done ? 'done' : avail.has(n.id) ? 'open' : 'locked';
      const label = n.type === 'playoff' ? F.TEAMS.playoffs[n.round].round : F.Map.LABELS[n.type];
      // The Card Shop you just left can be reopened until you play your next stop
      const reopen = canReopenShop(run, n);
      return `<button class="node nd-${n.type} ${state} ${run.pos === n.id ? 'current' : ''} ${reopen ? 'reopen' : ''}" style="left:${X(n)}%;top:${Y(n)}%" ${state === 'open' || reopen ? `data-action="enterNode" data-id="${n.id}"` : 'disabled'} aria-label="${reopen ? 'Back to the Card Shop' : label}" ${reopen ? 'title="Back to the Card Shop"' : ''}>
        <span class="nd-icon">${V.nodeIcon[n.type]}</span><span class="nd-label">${label}</span></button>`;
    }).join('');
    const target = cfg().TARGET_SCORE[run.act];
    let info;
    if (run.act < 6) info = `Games are played to <b>${target}</b>. Pick a path up the map. Beat the Marquee Game at the top to finish ${F.MONTHS[run.act]}.`;
    else if (run.act === 6) info = `Playoffs. One game per round, played to <b>${target + cfg().MARQUEE_TARGET_BONUS}</b>. <b>Lose once and your season is over.</b>`;
    else info = `The Finals. Best of three against The Superteam, played to <b>${target + cfg().MARQUEE_TARGET_BONUS}</b>. Win two games to become champion.`;
    const types = [...new Set(m.nodes.map(n => n.type))];
    return `${hud()}<div class="map-layout">${mapSidePanel(run)}<main class="map-screen">
      <div class="map-head">
        <div><div class="eyebrow">Month ${run.act + 1} of 8</div><h2>${F.MONTHS[run.act]}</h2></div>
        <p>${info}</p>
      </div>
      <div class="map-legend">${types.map(t => `<span class="lg nd-${t}"><span class="lg-i">${V.nodeIcon[t]}</span>${F.Map.LABELS[t]}</span>`).join('')}</div>
      <div class="map-wrap court-map phase-${V.courtPhase(run.act)}" style="min-height:${m.rows * 84}px">
        <div class="court-bg">${V.court(V.courtPhase(run.act), F.MONTHS[run.act])}</div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
        ${nodes}
      </div>
    </main></div>`;
  };

  function showMap() {
    UI.node = null;
    UI.go('map');
    const open = document.querySelector('.node.open');
    if (open) open.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const run = F.run;
    if (run.startPacks && run.startPacks.length) {
      const t = run.startPacks.shift();
      save();
      A.openPack(t, { title: 'Card Show VIP: your free pack' });
    }
  }
  F.showMap = showMap;

  // ================= Node flow =================
  function startGame(node) {
    const run = F.run;
    const team = F.Combat.pickTeam(run, node);
    F.combat = F.Combat.start(run, team, node.type);
    UI.lastTurn = 0;
    UI.go('combat');
  }
  F.startGame = startGame;

  const canReopenShop = (run, n) => n.type === 'shop' && n.done && run.pos === n.id && run.shopState && run.shopState.node === n.id;

  function completeNode() {
    const run = F.run;
    const node = UI.node;
    if (!node.done) run.path.push(node.id); // a reopened shop is already on the path
    node.done = true;
    run.pos = node.id;
    // Keep the shop's stock so it can be reopened until the next stop is played
    if (node.type !== 'shop') run.shopState = null;
    if (node.final) return endMonth();
    save();
    showMap();
  }

  function endMonth() {
    const run = F.run;
    const month = F.MONTHS[run.act];
    // Rings only for making the playoffs (finishing April)
    const rings = run.act === 5 ? cfg().RINGS_MAKE_PLAYOFFS : 0;
    run.ringsEarned += rings;
    F.Meta.data.rings += rings;
    F.Meta.data.best = Math.max(F.Meta.data.best, run.act);
    F.Meta.save();
    const healed = F.Run.heal(run, run.maxStamina * cfg().ACT_END_HEAL_PCT);
    run.act++;
    run.map = F.Map.generate(run.act);
    run.pos = null;
    run.path = [];
    save();
    UI.go('monthEnd', { month, rings, healed });
  }
  F.endMonth = endMonth;

  function seasonOver(reason) {
    const run = F.run;
    const meta = F.Meta.data;
    meta.runs++;
    meta.best = Math.max(meta.best, run.act);
    F.Binder.record(meta, run);
    F.Records.recordSeason(meta, run, reason === 'champion');
    F.Meta.save();
    F.Save.clearRun();
    F.run = null;
    F.combat = null;
    UI.overlay = null;
    UI.go('gameover', { reason, run });
  }

  function champion() {
    const run = F.run;
    const rings = cfg().RINGS_CHAMPIONSHIP;
    run.ringsEarned += rings;
    F.Meta.data.rings += rings;
    F.Meta.data.titles++;
    seasonOver('champion');
  }

  A.enterNode = d => {
    const run = F.run;
    const node = F.Map.node(run, d.id);
    if (node.done && !canReopenShop(run, node)) return;
    UI.node = node;
    if (node.type !== 'shop') run.shopState = null; // moving on closes the last shop for good
    switch (node.type) {
      case 'game': case 'rivalry': case 'boss': case 'playoff':
        return startGame(node);
      case 'finals':
        if (!run.finals) run.finals = { w: 0, l: 0 };
        return startGame(node);
      case 'shop':
        if (!run.shopState || run.shopState.node !== node.id) run.shopState = { node: node.id, stock: F.Packs.shopStock(), removed: false, bagSold: false };
        save();
        return UI.go('shop');
      case 'practice': return UI.go('practice', {});
      case 'locker': return UI.go('locker', {});
      case 'treasure': return UI.go('treasure', {});
      case 'event': {
        const unseen = F.EVENTS.filter(e => !run.eventsSeen.includes(e.id));
        const ev = U.pick(unseen.length ? unseen : F.EVENTS);
        run.eventsSeen.push(ev.id);
        return UI.go('event', { id: ev.id });
      }
    }
  };

  A.leaveNode = () => completeNode();

  // ================= Game over / finish =================
  A.finishGame = () => {
    const run = F.run;
    const c = F.combat;
    const node = UI.node;
    if (c.over === 'win') {
      run.record.w++;
      if (node.type === 'finals') {
        run.finals.w++;
        save();
        if (run.finals.w >= 2) return champion();
        return UI.go('series', { last: 'win', score: `${c.you}-${c.opp}` });
      }
      const rw = F.Combat.rewards(run, c, node);
      run.bucks += rw.bucks;
      if (rw.item) F.Run.addMemorabilia(run, rw.item);
      save();
      return UI.go('reward', { rw });
    }
    run.record.l++;
    if (c.knockout || run.stamina <= 0) return seasonOver('stamina');
    if (node.type === 'playoff') return seasonOver('eliminated');
    if (node.type === 'finals') {
      run.finals.l++;
      save();
      if (run.finals.l >= 2) return seasonOver('finals');
      return UI.go('series', { last: 'loss', score: `${c.you}-${c.opp}` });
    }
    F.Run.damage(run, F.Combat.lossStamina(c));
    if (run.stamina <= 0) return seasonOver('stamina');
    completeNode();
  };

  // ================= Rewards =================
  S.reward = ({ rw }) => {
    const allDone = rw.packs.every(p => p.opened) && (!rw.stats || rw.statTaken);
    return `${hud()}<main class="center-screen">
      <div class="eyebrow">Victory</div>
      <h2 class="huge">W ${rw.score}</h2>
      <div class="receipt">
        <div class="rc-row"><span>Win bonus</span><b>+${rw.base}</b></div>
        <div class="rc-row"><span>Victory margin (won by ${rw.marginPts})</span><b>+${rw.margin}</b></div>
        ${rw.logo ? `<div class="rc-row"><span>The Logo's Ticket Stub</span><b>+${rw.logo}</b></div>` : ''}
        <div class="rc-row total"><span>Bucks earned</span><b>+${rw.bucks}</b></div>
      </div>
      ${rw.item ? `<div class="reward-item"><div class="eyebrow">Added to your Memorabilia</div>${V.memoCard(rw.item)}</div>` : ''}
      <div class="reward-actions">${rw.packs.map((p, i) => p.opened
        ? `<span class="done-tag">${F.PACKS[p.type].name} opened</span>`
        : `<button class="pack-btn" data-action="rewardPack" data-i="${i}">${V.pack(p.type, p.theme)}<span class="btn primary">Open ${F.PACKS[p.type].name}</span></button>`).join('')}</div>
      ${rw.stats && !rw.statTaken ? `<div class="stat-choice"><h3>Improve your Rookie Card</h3><div class="stat-buttons">${rw.stats.map((s, i) => `<button class="btn" data-action="rewardStat" data-i="${i}">+${s.n} ${F.STATS.find(x => x.key === s.stat).label}</button>`).join('')}</div></div>` : ''}
      <button class="btn ${allDone ? 'primary' : 'ghost'}" data-action="leaveNode">${allDone ? 'Continue' : 'Skip the rest and continue'}</button>
    </main>`;
  };

  A.rewardPack = d => {
    const p = UI.ctx.rw.packs[+d.i];
    A.openPack(p.type, { theme: p.theme, onDone: () => { p.opened = true; UI.render(); } });
  };

  A.rewardStat = d => {
    const rw = UI.ctx.rw;
    const s = rw.stats[+d.i];
    F.Run.addStat(F.run, s.stat, s.n);
    rw.statTaken = true;
    save();
    UI.toast(`${F.STATS.find(x => x.key === s.stat).label} +${s.n}`);
    UI.render();
  };

  // ================= Packs =================
  A.openPack = (type, opts = {}) => {
    UI.overlay = { kind: 'pack', type, theme: opts.theme || null, title: opts.title || null, stage: 'sealed', onDone: opts.onDone || null };
    UI.render();
  };

  // ---------- Pack opening show ----------
  // sealed -> ripping (shake, glow, tear) -> reveal (cards dealt face down, flipped one by one)
  // -> open (pick a card). "Reveal all" skips straight to the end.
  const TIER_GLOW = ['#9aa6c8', '#7fd3ff', '#b18cff', '#ffd23f', '#ff8a3d', '#ff4d6d', '#ffffff'];
  const pullScore = c => c.tier + (F.CARDS[c.id].pool === 'showtime' ? 1.5 : 0);
  const isBig = c => c.tier >= 3 || F.CARDS[c.id].pool === 'showtime';
  const RIP_TIME = 1.35;

  // When each card is dealt and flipped. The rarest card flips last; big pulls tease first.
  function revealPlan(res) {
    const order = res.cards.map((c, i) => i).sort((a, b) => pullScore(res.cards[a]) - pullScore(res.cards[b]));
    const plan = res.cards.map((c, i) => ({ deal: 0.1 + i * 0.1, flip: 0, tease: 0 }));
    let t = 0.55 + res.cards.length * 0.1;
    order.forEach(i => {
      const big = isBig(res.cards[i]);
      if (big) { plan[i].tease = t; t += 0.65; }
      plan[i].flip = t;
      t += big ? (res.cards[i].tier === 6 ? 1.6 : 0.95) : 0.42;
    });
    const hitAt = t + 0.15;
    const end = res.hit ? hitAt + 1.5 : t + 0.25;
    return { plan, hitAt, end };
  }

  const cardBack = () => `<div class="card-back" aria-hidden="true"><span class="cb-ball"></span><b>FCD</b><small>Full Court Deck</small></div>`;

  function later(o, sec, fn) {
    o.timers = o.timers || [];
    o.timers.push(setTimeout(() => { if (UI.overlay === o) fn(); }, sec * 1000));
  }
  function stopShow(o) { (o.timers || []).forEach(clearTimeout); o.timers = []; }
  const sfx = (name, delay) => { if (F.Audio && F.Audio.sfx) F.Audio.sfx(name, delay || 0); };

  function startReveal(o) {
    o.stage = 'reveal';
    const { plan, hitAt, end } = o.plan = revealPlan(o.res);
    UI.renderOverlay();
    sfx('deal');
    o.res.cards.forEach((card, i) => {
      if (plan[i].tease) later(o, plan[i].tease, () => sfx('tease'));
      later(o, plan[i].flip, () => {
        sfx('flip');
        const d = F.CARDS[card.id];
        if (card.tier === 6) sfx('jackpot');
        else if (d.pool === 'showtime') { sfx('pow'); sfx('rarePull', 0.1); }
        else if (card.tier >= 4) { sfx('rarePull'); sfx('cheer', 0.2); }
        else if (card.tier === 3) sfx('rarePull');
        else if (card.tier > 0) sfx(card.tier === 1 ? 'ding1' : 'ding2');
      });
    });
    if (o.res.hit) later(o, hitAt, () => sfx('autoSlam'));
    later(o, end, () => finishReveal(o));
  }
  function finishReveal(o) {
    stopShow(o);
    o.stage = 'open';
    UI.renderOverlay();
  }
  A.revealAll = () => { const o = UI.overlay; if (o && (o.stage === 'ripping' || o.stage === 'reveal')) finishReveal(o); };

  OV.pack = o => {
    const p = F.PACKS[o.type];
    const name = `${p.name}${o.theme ? `: ${F.THEMES[o.theme]}` : ''}`;
    if (o.stage === 'sealed') {
      return `<div class="ov"><div class="pack-stage">
        <div class="eyebrow">${esc(o.title || 'New pack')}</div>
        <h2>${esc(name)}</h2>
        <button class="pack-btn rip" data-action="ripPack" aria-label="Rip open the pack">${V.pack(o.type, o.theme, 'big shake')}</button>
        <button class="btn primary" data-action="ripPack">Rip it open</button>
      </div></div>`;
    }
    if (o.stage === 'ripping') {
      // The pack glows in the color of the best card inside
      const best = Math.max(...o.res.cards.map(c => c.tier), o.res.hit ? o.res.hit.card.tier : 0);
      const sparks = Array.from({ length: 16 }, (_, i) => `<i style="--a:${i * 22.5 + Math.random() * 10}deg;--r:${110 + Math.random() * 90}px"></i>`).join('');
      return `<div class="ov"><div class="pack-stage ripping" style="--glow:${TIER_GLOW[best]}">
        <div class="eyebrow">${esc(o.title || 'New pack')}</div>
        <h2>${esc(name)}</h2>
        <div class="rip-box">
          <div class="rip-glow"></div>
          <div class="rip-piece rip-bottom">${V.pack(o.type, o.theme, 'big')}</div>
          <div class="rip-piece rip-top">${V.pack(o.type, o.theme, 'big')}</div>
          <div class="rip-flash"></div>
          <div class="rip-sparks">${sparks}</div>
        </div>
        <button class="btn ghost small" data-action="revealAll">Reveal all</button>
      </div></div>`;
    }
    if (o.stage === 'reveal') {
      const { plan, hitAt } = o.plan;
      const cards = o.res.cards.map((card, i) => {
        const t = F.TIERS[card.tier];
        const st = F.CARDS[card.id].pool === 'showtime';
        const cls = `${isBig(card) ? 'big' : ''} ${card.tier === 6 ? 'one' : ''} ${st ? 'st' : ''}`;
        return `<div class="rv ${cls}" style="--deal:${plan[i].deal}s;--flip:${plan[i].flip}s;--tease:${plan[i].tease || 0}s;--glow:${TIER_GLOW[card.tier]}">
          <span class="rv-burst"></span>
          <div class="rv-shake"><div class="rv-flip"><div class="rv-face rv-front">${V.card(F.run, card)}</div><div class="rv-face rv-back">${cardBack()}</div></div></div>
          <span class="rv-tag">${st ? `Showtime ${t.label}` : card.tier === 6 ? 'ONE OF ONE!' : card.tier > 0 ? t.label : ''}</span>
        </div>`;
      }).join('');
      const hit = o.res.hit ? `<div class="rv-hit" style="--at:${hitAt}s"><span class="rv-stamp">AUTOGRAPH!</span>${V.card(F.run, o.res.hit.card)}</div>` : '';
      return `<div class="ov"><div class="pack-stage revealing">
        <div class="eyebrow">${esc(name)}</div>
        <h2>Here's what you pulled...</h2>
        <div class="pull-row">${cards}</div>
        ${hit}
        <button class="btn ghost small" data-action="revealAll">Reveal all</button>
      </div></div>`;
    }
    const res = o.res;
    // A bonus Autograph must be kept or passed before picking from the pack
    const autoPending = res.hit && res.hit.kind === 'auto' && !o.autoDecision;
    const pulls = res.cards.map((card, i) => {
      const t = F.TIERS[card.tier];
      const d = F.CARDS[card.id];
      let tag = '';
      if (d.pool === 'showtime') tag = `<span class="pull-tag st">Showtime insert ${t.label}</span>`;
      else if (card.tier >= 3) tag = `<span class="pull-tag rare">Short print ${t.label}</span>`;
      else if (card.tier > 0) tag = `<span class="pull-tag">Numbered ${t.label}</span>`;
      return `<button class="pull ${autoPending ? 'waiting' : ''}" data-action="pickPull" data-i="${i}" style="--d:${i * 0.22}s" ${autoPending ? 'disabled' : ''}>${V.card(F.run, card)}${tag}</button>`;
    }).join('');
    let hit = '';
    if (res.hit && res.hit.kind === 'auto') {
      const choice = !o.autoDecision
        ? `<div class="auto-choice"><button class="btn primary" data-action="keepAuto">Keep it</button><button class="btn" data-action="passAuto">Pass</button></div>`
        : `<span class="done-tag">${o.autoDecision === 'kept' ? 'Added to your deck' : 'Passed'}</span>`;
      hit = `<div class="hit"><div class="eyebrow">Bonus hit: Autograph</div>
        <div class="hit-row">${V.card(F.run, res.hit.card)}<div class="hit-side"><span class="fine">Keep this Autograph in your deck, or pass on it.</span>${choice}</div></div></div>`;
    }
    return `<div class="ov"><div class="pack-stage open settled">
      <div class="eyebrow">${esc(name)}</div>
      <h2>${autoPending ? 'You pulled an Autograph!' : 'Pick one card for your deck'}</h2>
      ${autoPending ? '<p class="fine">Decide on the Autograph below, then pick one card from the pack.</p>' : ''}
      <div class="pull-row">${pulls}</div>
      ${hit}
      <button class="btn ghost" data-action="skipPull" ${autoPending ? 'disabled' : ''}>Skip (keep my deck as is)</button>
    </div></div>`;
  };

  A.keepAuto = () => {
    const o = UI.overlay;
    if (!o || !o.res || o.autoDecision) return;
    F.run.deck.push(o.res.hit.card);
    o.autoDecision = 'kept';
    save();
    UI.toast(`${F.CARDS[o.res.hit.card.id].name} added to your deck.`);
    UI.render();
  };
  A.passAuto = () => {
    const o = UI.overlay;
    if (!o || !o.res || o.autoDecision) return;
    o.autoDecision = 'passed';
    UI.render();
  };

  A.ripPack = () => {
    const o = UI.overlay;
    if (!o || o.stage !== 'sealed') return;
    o.res = F.Packs.open(F.run, o.type, o.theme);
    save();
    // Players who prefer less motion skip the show
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sfx('packRip');
      o.stage = 'open';
      return UI.render();
    }
    o.stage = 'ripping';
    UI.render();
    sfx('crinkle');
    later(o, RIP_TIME - 0.45, () => sfx('tear'));
    later(o, RIP_TIME, () => startReveal(o));
  };

  function finishPack(msg) {
    const o = UI.overlay;
    if (o) stopShow(o);
    UI.overlay = null;
    save();
    if (msg) UI.toast(msg);
    if (o && o.onDone) o.onDone();
    else UI.render();
  }

  const autoPending = o => o && o.res && o.res.hit && o.res.hit.kind === 'auto' && !o.autoDecision;

  A.pickPull = d => {
    const o = UI.overlay;
    if (autoPending(o)) return;
    const card = o.res.cards[+d.i];
    F.Packs.take(F.run, card);
    finishPack(`${F.CARDS[card.id].name} (${F.TIERS[card.tier].label}) added to your deck.`);
  };
  A.skipPull = () => { if (!autoPending(UI.overlay)) finishPack(); };

  // ================= Shop =================
  S.shop = () => {
    const run = F.run;
    const st = run.shopState;
    // Percent for the shop label: whole numbers, but keep small chances like 0.33% readable
    const pct = x => { const v = x * 100; return v >= 1 ? Math.round(v) : +v.toFixed(2); };
    const tile = (p, i) => {
      const pk = F.PACKS[p.type];
      if (!pk) return ''; // a pack that no longer exists (e.g. Throwback Pack in an old save)
      const rare = Math.round(F.Packs.rareChance(p.type) * 100);
      const can = !p.sold && run.bucks >= p.price;
      return `<div class="pack-tile ${p.sold ? 'sold' : ''}">
        ${V.pack(p.type, p.theme)}
        <div class="pt-name">${esc(pk.name)}${p.theme ? `<small>${F.THEMES[p.theme]}</small>` : ''}</div>
        <div class="pt-odds">${pk.guaranteed ? 'Guaranteed /99 or better' : `${rare}% chance of /99 or better`}<br>${pct(pk.hit)}% Autograph · ${pct(pk.showtime)}% Showtime</div>
        ${p.sold ? '<span class="done-tag">Sold</span>' : `<button class="btn ${can ? 'primary' : ''}" data-action="buyPack" data-i="${i}" ${can ? '' : 'disabled'}>${p.price} Bucks</button>`}
      </div>`;
    };
    return `${hud()}<main class="shop">
      <div class="shop-head"><div><div class="eyebrow">Card Shop</div><h2>The Card Shop</h2></div><p>Packs are opened right away. You pick one card from each pack. If you pull a bonus Autograph, you choose to keep it or pass.</p></div>
      <div class="shelf">${st.stock.map(tile).join('')}</div>
      ${bagCounter(run, st)}
      <div class="services">
        <div class="svc"><div><h3>Sell a card</h3><p>One card per visit. Rarer serial numbers sell for more. Showtime cards sell for double.</p></div>
          ${st.sold ? '<span class="done-tag">Sold</span>' : `<button class="btn" data-action="shopSell" ${run.deck.length > 5 ? '' : 'disabled'}>Choose a card</button>`}</div>
      </div>
      <div class="leave"><button class="btn primary" data-action="leaveNode">Leave the shop</button></div>
    </main>`;
  };

  // The memorabilia counter: one Mystery Bag per shop visit
  function bagCounter(run, st) {
    const left = F.Run.availableMemorabilia(run).length;
    const price = cfg().MYSTERY_BAG_PRICE;
    let action;
    if (st.bagSold) action = '<span class="done-tag">Sold</span>';
    else if (!left) action = '<span class="done-tag">You own every item</span>';
    else action = `<button class="btn ${run.bucks >= price ? 'primary' : ''}" data-action="buyBag" ${run.bucks >= price ? '' : 'disabled'}>${price} Bucks</button>`;
    return `<div class="bag-counter ${st.bagSold || !left ? 'sold' : ''}">
      <div class="memo-case bag-case">${V.mysteryBag()}</div>
      <div class="bag-info">
        <div class="mc-kind">Memorabilia counter</div>
        <h3>Mystery Bag</h3>
        <p>One random piece of memorabilia you don't own yet. ${left} of ${Object.keys(F.MEMORABILIA).length} items could be inside.</p>
      </div>
      ${action}
    </div>`;
  }

  A.buyBag = () => {
    const run = F.run;
    const st = run.shopState;
    const price = cfg().MYSTERY_BAG_PRICE;
    const left = F.Run.availableMemorabilia(run);
    if (st.bagSold || !left.length || run.bucks < price) return;
    run.bucks -= price;
    st.bagSold = true;
    A.revealItem(U.pick(left), { look: 'bag', title: 'Mystery Bag' });
  };

  // Reveal a memorabilia item: sealed bag or gift box first, then the item
  A.revealItem = (id, opts = {}) => {
    F.Run.addMemorabilia(F.run, id);
    save();
    UI.overlay = { kind: 'item', id, look: opts.look || 'bag', title: opts.title || 'Memorabilia', stage: 'sealed', onDone: opts.onDone || null };
    UI.render();
  };

  OV.item = o => {
    if (o.stage === 'sealed') {
      return `<div class="ov"><div class="pack-stage">
        <div class="eyebrow">${esc(o.title)}</div>
        <h2>What's inside?</h2>
        <button class="pack-btn rip" data-action="openItem" aria-label="Open it">${o.look === 'gift' ? V.giftBox() : V.mysteryBag()}</button>
        <button class="btn primary" data-action="openItem">${o.look === 'gift' ? 'Unwrap it' : 'Open the bag'}</button>
      </div></div>`;
    }
    return `<div class="ov"><div class="pack-stage item-reveal">
      <div class="eyebrow">${esc(o.title)}</div>
      <h2>Added to your Memorabilia</h2>
      <div class="item-spot">${V.memoCard(o.id)}</div>
      <button class="btn primary" data-action="closeItem">Nice!</button>
    </div></div>`;
  };

  A.openItem = () => { UI.overlay.stage = 'open'; UI.render(); };
  A.closeItem = () => {
    const o = UI.overlay;
    UI.overlay = null;
    if (o && o.onDone) o.onDone();
    else UI.render();
  };

  A.buyPack = d => {
    const run = F.run;
    const item = run.shopState.stock[+d.i];
    if (!item || item.sold || run.bucks < item.price) return;
    run.bucks -= item.price;
    item.sold = true;
    save();
    A.openPack(item.type, { theme: item.theme });
  };

  A.shopSell = () => {
    if (F.run.shopState.sold) return; // one sale per shop visit
    UI.open('deck', {
      mode: 'sell',
      title: 'Sell a card (one per visit)',
      onPick: uid => {
        const run = F.run;
        if (run.shopState.sold) return;
        const card = run.deck.find(c => c.uid === uid);
        const v = F.Run.sellValue(card);
        run.bucks += v;
        run.shopState.sold = true;
        F.Run.removeCard(run, uid);
        save();
        UI.toast(`Sold ${F.CARDS[card.id].name} for ${v} Bucks.`);
        UI.render();
      },
    });
  };

  // ================= Deck overlay (view / pick) =================
  const TYPE_ORDER = { shot: 0, defense: 1, play: 2, auto: 3, status: 4 };
  const sortCards = list => list.slice().sort((a, b) => {
    const da = F.CARDS[a.id];
    const db = F.CARDS[b.id];
    return TYPE_ORDER[da.type] - TYPE_ORDER[db.type] || da.name.localeCompare(db.name) || b.tier - a.tier;
  });

  OV.deck = o => {
    const run = F.run;
    const mode = o.mode || 'view';
    const multi = o.picks > 1;
    const sel = o.selected || [];
    const spent = pointsUsed(run, sel);
    const left = (o.picks || 1) - spent;
    let list = sortCards(run.deck);
    // Selling: cheapest first (stable sort keeps the usual order within a price)
    if (mode === 'sell') list.sort((a, b) => F.Run.sellValue(a) - F.Run.sellValue(b));
    const items = list.map(card => {
      if (mode === 'view') return V.card(run, card);
      const on = sel.includes(card.uid);
      const cost = F.Run.upgradeCost(card);
      const fits = !multi || on || cost <= left;
      const ok = mode !== 'upgrade' || (F.Run.canUpgrade(card) && fits);
      let note = '';
      if (mode === 'upgrade') {
        const to = F.Run.canUpgrade(card) ? F.TIERS[card.tier + 1].label : '';
        const both = cost > 1 && multi ? ' (uses both upgrades)' : '';
        if (on) note = `✓ Upgrading to ${to}${both}`;
        else if (F.Run.canUpgrade(card) && !fits) note = left <= 0 ? 'No upgrades left' : `To ${to}: needs both upgrades`;
        else if (ok) note = `Upgrade to ${to}${both}`;
        else if (card.tier === F.Run.MAX_UPGRADE_TIER) note = "/10 is the max: can't upgrade";
        else note = card.tier === F.TIERS.length - 1 ? "1/1: can't upgrade" : "Can't upgrade";
      }
      if (mode === 'sell') note = `Sell for ${F.Run.sellValue(card)}`;
      if (mode === 'remove') note = 'Remove';
      return `<div class="deck-item ${on ? 'selected' : ''}">${V.card(run, card, { tag: 'button', cls: ok ? 'pickable' : 'disabled', attrs: ok ? `data-action="pickDeck" data-uid="${card.uid}"` : 'disabled' })}<span>${note}</span></div>`;
    }).join('');
    // Picking several cards: click to select / unselect, then confirm.
    // Each upgrade costs points: 1 normally, 2 (both) to reach /25 or /10.
    const confirm = multi ? `<button class="btn primary" data-action="confirmPicks" ${canConfirm(run, o) ? '' : 'disabled'}>Upgrade · ${spent}/${o.picks} used</button>` : '';
    return `<div class="ov"><div class="ov-panel">
      <div class="ov-head"><div><div class="eyebrow">${multi ? `${o.picks} upgrades · ${left} left · reaching /25 or /10 uses both` : `${run.deck.length} cards`}</div><h2>${esc(o.title || 'Your deck')}</h2></div><div class="ov-btns">${confirm}<button class="btn" data-action="closeOverlay">${mode === 'view' ? 'Close' : 'Cancel'}</button></div></div>
      <div class="deck-grid">${items}</div>
    </div></div>`;
  };

  // Upgrade points used by the selected cards
  function pointsUsed(run, sel) {
    return sel.reduce((s, uid) => { const c = run.deck.find(x => x.uid === uid); return s + (c ? F.Run.upgradeCost(c) : 0); }, 0);
  }
  // Ready when all points are used, or nothing else fits the points left
  function canConfirm(run, o) {
    const sel = o.selected || [];
    if (!sel.length) return false;
    const left = o.picks - pointsUsed(run, sel);
    return !run.deck.some(c => !sel.includes(c.uid) && F.Run.canUpgrade(c) && F.Run.upgradeCost(c) <= left);
  }

  A.pickDeck = d => {
    const o = UI.overlay;
    // /10 and 1/1 cards can never be picked for an upgrade
    if (o.mode === 'upgrade') {
      const card = F.run.deck.find(c => c.uid === +d.uid);
      if (!card || !F.Run.canUpgrade(card)) { UI.toast("That card can't be upgraded any further."); return; }
    }
    if (o.picks > 1) {
      const uid = +d.uid;
      const sel = o.selected || (o.selected = []);
      const i = sel.indexOf(uid);
      const card = F.run.deck.find(c => c.uid === uid);
      if (i >= 0) sel.splice(i, 1);
      else if (pointsUsed(F.run, sel) + F.Run.upgradeCost(card) <= o.picks) sel.push(uid);
      else UI.toast('Not enough upgrades left for that card. Unselect one first.');
      UI.renderOverlay();
      return;
    }
    const cb = o.onPick;
    UI.overlay = null;
    cb(+d.uid);
  };
  A.confirmPicks = () => {
    const o = UI.overlay;
    if (!canConfirm(F.run, o)) return;
    const cb = o.onPick;
    const sel = (o.selected || []).slice();
    UI.overlay = null;
    cb(sel);
  };

  A.viewDeck = () => UI.open('deck', { mode: 'view' });
  A.closeOverlay = () => UI.close();

  // ================= Rookie Card overlay =================
  // Rookie Card details: used in the popup and in the map screen's side panel
  function rookieDetails(run) {
    const ch = F.CHARACTERS[run.charId];
    return `<div class="mech"><b>${esc(ch.mechanic.name)}</b><span>${esc(ch.mechanic.text)}</span></div>
      ${V.statTable(run.stats, run.baseStats, F.CHARACTERS[run.charId].stats)}
      <p class="fine">Stat gains this season: +${F.Run.statGain(run)}.</p>
      <div><div class="eyebrow">Memorabilia</div>${run.memorabilia.length ? `<div class="memo-list">${run.memorabilia.map(id => V.memoCard(id)).join('')}</div>` : '<p class="fine">No memorabilia yet. Find it in Rivalry Games, events and Sponsor Gifts, or buy a Mystery Bag in the Card Shop.</p>'}</div>`;
  }

  OV.rookie = () => {
    const run = F.run;
    const ch = F.CHARACTERS[run.charId];
    return `<div class="ov"><div class="ov-panel rookie-panel">
      <div class="ov-head"><div><div class="eyebrow">${esc(ch.team)}</div><h2>${esc(ch.name)}: Rookie Card</h2></div><button class="btn" data-action="closeOverlay">Close</button></div>
      <div class="rookie-body">
        ${V.rookieCard(run.charId, run)}
        <div class="rookie-side">${rookieDetails(run)}</div>
      </div>
    </div></div>`;
  };

  // Compact side panel on the map screen (shown when the window is wide enough).
  // Sized to fit on screen without scrolling.
  function mapSidePanel(run) {
    const ch = F.CHARACTERS[run.charId];
    return `<aside class="map-side" aria-label="Your Rookie Card">
      <div class="ms-top">
        <button class="ms-card" data-action="viewRookie" aria-label="Open your Rookie Card">${V.rookieCard(run.charId, run)}</button>
        <div class="ms-id">
          <div class="eyebrow">${esc(ch.team)}</div>
          <h3>${esc(ch.name)}</h3>
          <div class="mech"><b>${esc(ch.mechanic.name)}</b><span>${esc(ch.mechanic.text)}</span></div>
        </div>
      </div>
      ${V.statTable(run.stats, run.baseStats, F.CHARACTERS[run.charId].stats)}
      <p class="fine">Stat gains: +${F.Run.statGain(run)}.</p>
      <div class="ms-memo"><div class="eyebrow">Memorabilia</div>
        ${run.memorabilia.length ? `<div class="memo-row">${run.memorabilia.map(id => V.memo(id)).join('')}</div>` : '<p class="fine">None yet.</p>'}
      </div>
    </aside>`;
  }
  A.viewRookie = () => UI.open('rookie');

  // ================= Practice / Locker / Treasure =================
  S.practice = () => {
    const run = F.run;
    return `${hud()}<main class="center-screen">
      <div class="eyebrow">Practice Facility</div><h2>Put in the work</h2><p>Choose one.</p>
      <div class="choice-grid">
        <div class="choice"><h3>Train a stat</h3><p>Pick an area to work on. One random stat in it gets +1 for the rest of the season.</p>
          <div class="train-groups">${Object.keys(F.TRAIN_GROUPS).map(g => `<button class="btn" data-action="train" data-group="${g}">${g}
            <small>${F.TRAIN_GROUPS[g].map(k => `${k} ${run.stats[k]}`).join(' · ')}</small></button>`).join('')}</div></div>
        <div class="choice"><h3>Upgrade cards</h3><p>You get 2 upgrades. Each moves a different card up one serial tier (Base to /500, /500 to /250, /250 to /99). Taking a card to /25 or /10 uses both. A 1/1 can only be pulled from a pack. Rarer cards have bigger numbers, and at /25 and up some cost less Energy.</p>
          <button class="btn primary" data-action="practiceUpgrade">Choose cards</button></div>
      </div>
    </main>`;
  };
  const fmtBonus = b => (b > 0 ? `+${b}` : `${b}`);

  // Train: pick a group, a random stat in it gets +1
  A.train = d => {
    const group = F.TRAIN_GROUPS[d.group];
    const open = group.filter(k => F.run.stats[k] < cfg().STAT_MAX); // skip maxed-out stats
    const key = F.U.pick(open.length ? open : group);
    F.Run.addStat(F.run, key, 1);
    UI.toast(`${d.group} training: ${F.STATS.find(s => s.key === key).label} +1!`);
    completeNode();
  };

  // Practice Facility and Locker Room: upgrade 2 different cards one tier each
  A.practiceUpgrade = () => {
    UI.open('deck', {
      mode: 'upgrade',
      title: 'Upgrade cards',
      picks: cfg().UPGRADE_PICKS,
      selected: [],
      onPick: uids => {
        const done = uids.map(uid => F.Run.upgradeCard(F.run, uid)).filter(Boolean);
        if (done.length) UI.toast(done.map(c => `${F.CARDS[c.id].name} → ${F.TIERS[c.tier].label}`).join(' · '));
        completeNode();
      },
    });
  };

  S.locker = () => {
    const run = F.run;
    const heal = Math.round(run.maxStamina * cfg().LOCKER_HEAL_PCT);
    const canUpgrade = run.deck.some(F.Run.canUpgrade);
    return `${hud()}<main class="center-screen">
      <div class="eyebrow">Locker Room</div><h2>Recover</h2><p>Choose one.</p>
      <div class="choice-grid three">
        <div class="choice"><h3>Rest</h3><p>Recover up to ${heal} Stamina.</p><button class="btn primary" data-action="rest">Rest (+${Math.min(heal, run.maxStamina - run.stamina)})</button></div>
        <div class="choice"><h3>Ice bath</h3><p>+5 max Stamina for the rest of the season.</p><button class="btn" data-action="iceBath">Ice bath</button></div>
        <div class="choice"><h3>Film session</h3><p>2 upgrades: move two different cards up one serial tier each. Taking a card to /25 or /10 uses both.</p><button class="btn" data-action="practiceUpgrade" ${canUpgrade ? '' : 'disabled'}>${canUpgrade ? 'Choose cards' : 'No cards to upgrade'}</button></div>
      </div>
    </main>`;
  };
  A.rest = () => {
    const h = F.Run.heal(F.run, F.run.maxStamina * cfg().LOCKER_HEAL_PCT);
    UI.toast(`Recovered ${h} Stamina.`);
    completeNode();
  };
  A.iceBath = () => {
    F.run.bonusStamina += 5;
    F.Run.refreshMax(F.run);
    UI.toast('+5 max Stamina.');
    completeNode();
  };

  // Sponsor Gift: a random piece of memorabilia (a free pack if you own every item)
  S.treasure = ctx => {
    if (ctx && ctx.bucks) {
      return `${hud()}<main class="center-screen">
        <div class="eyebrow">Sponsor Gift</div>
        <h2>${ctx.bucks} Bucks!</h2>
        <p>The sponsor tucked a stack of cash inside. You now have ${F.run.bucks} Bucks.</p>
        <button class="btn primary" data-action="leaveNode">Continue</button>
      </main>`;
    }
    const hasItems = F.Run.availableMemorabilia(F.run).length > 0;
    return `${hud()}<main class="center-screen">
      <div class="eyebrow">Sponsor Gift</div>
      <h2>${hasItems ? 'A sponsor sent you a gift' : 'A sponsor sent you a pack'}</h2>
      <p>${hasItems ? `Could be a piece of memorabilia, or ${cfg().SPONSOR_BUCKS} Bucks.` : `Could be a free Team Pack, or ${cfg().SPONSOR_BUCKS} Bucks.`}</p>
      <button class="pack-btn" data-action="openSponsor">${hasItems ? V.giftBox() : V.pack('team', null)}<span class="btn primary">Open it</span></button>
    </main>`;
  };
  A.openSponsor = () => {
    // Loot table: SPONSOR_BUCKS_CHANCE for Bucks, otherwise a random item you don't own (or a Team Pack)
    if (Math.random() < cfg().SPONSOR_BUCKS_CHANCE) {
      F.run.bucks += cfg().SPONSOR_BUCKS;
      if (F.Audio && F.Audio.sfx) F.Audio.sfx('bucks');
      save();
      return UI.go('treasure', { bucks: cfg().SPONSOR_BUCKS });
    }
    const left = F.Run.availableMemorabilia(F.run);
    if (left.length) return A.revealItem(U.pick(left), { look: 'gift', title: 'Sponsor Gift', onDone: () => completeNode() });
    A.openPack('team', { theme: U.pick(Object.keys(F.THEMES)), title: 'Sponsor Gift', onDone: () => completeNode() });
  };

  // ================= Events =================
  S.event = ctx => {
    const ev = F.EVENTS.find(e => e.id === ctx.id);
    const run = F.run;
    return `${hud()}<main class="center-screen event">
      <div class="eyebrow">Trade Deadline</div><h2>${esc(ev.title)}</h2>
      <p class="ev-text">${esc(ev.text)}</p>
      ${ctx.result
        ? `<p class="ev-result">${esc(ctx.result)}</p><button class="btn primary" data-action="leaveNode">Continue</button>`
        : `<div class="ev-choices">${ev.choices.map((c, i) => {
            const ok = !c.can || c.can(run);
            return `<button class="ev-choice" data-action="eventChoice" data-i="${i}" ${ok ? '' : 'disabled'}><b>${esc(c.label)}</b><span>${esc(c.desc)}</span></button>`;
          }).join('')}</div>`}
    </main>`;
  };

  A.eventChoice = d => {
    const run = F.run;
    const ev = F.EVENTS.find(e => e.id === UI.ctx.id);
    const ch = ev.choices[+d.i];
    if (ch.can && !ch.can(run)) return;
    const r = ch.apply(run);
    const res = typeof r === 'string' ? { text: r } : r;
    UI.ctx.result = res.text;
    save();
    if (res.then === 'remove') {
      UI.open('deck', {
        mode: 'remove',
        title: 'Trade away a card',
        onPick: uid => {
          const card = run.deck.find(c => c.uid === uid);
          F.Run.removeCard(run, uid);
          UI.ctx.result = `${F.CARDS[card.id].name} was traded away.`;
          save();
          UI.render();
        },
      });
    } else if (res.then && res.then.startsWith('pack:')) {
      A.openPack(res.then.slice(5), { title: ev.title });
    } else {
      UI.render();
    }
  };

  // ================= Month end / Finals series / Game over =================
  S.monthEnd = ctx => {
    const run = F.run;
    const next = F.MONTHS[run.act];
    const note = run.act === 6 ? 'The regular season is over. Welcome to the Playoffs: one game per round, and a loss ends your season.'
      : run.act === 7 ? 'You won the Conference. Next up: The Finals, best of three.'
      : `On to ${next}. Opponents get tougher every month.`;
    return `${hud()}<main class="center-screen">
      <div class="eyebrow">Month complete</div><h2 class="huge">${esc(ctx.month)}</h2>
      <div class="receipt">
        ${ctx.rings ? `<div class="rc-row"><span>Rings earned (made the playoffs)</span><b>+${ctx.rings}</b></div>` : ''}
        <div class="rc-row"><span>Stamina recovered</span><b>+${ctx.healed}</b></div>
      </div>
      <p>${note}</p>
      <button class="btn primary" data-action="toMap">Start ${next}</button>
    </main>`;
  };
  A.toMap = () => showMap();

  S.series = ctx => {
    const run = F.run;
    const f = run.finals;
    return `${hud()}<main class="center-screen">
      <div class="eyebrow">The Finals · Best of three</div>
      <h2 class="huge">Series ${f.w}-${f.l}</h2>
      <p>${ctx.last === 'win' ? `You took that one ${ctx.score}.` : `The Superteam won that one ${ctx.score.split('-').reverse().join('-')}.`} ${f.w === 1 && f.l === 1 ? 'It all comes down to Game 3.' : ''}</p>
      <button class="btn primary" data-action="nextFinalsGame">Play Game ${f.w + f.l + 1}</button>
    </main>`;
  };
  A.nextFinalsGame = () => startGame(UI.node);

  S.gameover = ({ reason, run }) => {
    const titles = {
      champion: ['Champions!', 'You beat The Superteam and won the title.'],
      finals: ['Runner-up', 'The Superteam won the Finals. So close.'],
      eliminated: ['Eliminated', 'Your playoff run is over.'],
      stamina: ['Out of gas', 'You ran out of Stamina. Your season is over.'],
    };
    const [title, sub] = titles[reason];
    const best = run.bestPull;
    return `<main class="center-screen gameover ${reason}">
      <div class="eyebrow">Season over</div>
      <h2 class="huge">${title}</h2>
      <p>${sub}</p>
      <div class="receipt">
        <div class="rc-row"><span>Star</span><b>${esc(F.CHARACTERS[run.charId].name)}</b></div>
        <div class="rc-row"><span>Made it to</span><b>${F.MONTHS[run.act]}</b></div>
        <div class="rc-row"><span>Record</span><b>${run.record.w}-${run.record.l}</b></div>
        <div class="rc-row"><span>Season time</span><b>${F.Records.fmt(run.playMs)}</b></div>
        <div class="rc-row"><span>Deck size</span><b>${run.deck.length}</b></div>
        <div class="rc-row total"><span>Rings earned</span><b>+${run.ringsEarned}</b></div>
      </div>
      ${best ? `<div class="best-pull"><div class="eyebrow">Best pull of the season</div>${V.card(run, best)}</div>` : ''}
      <p class="fine">${(run.pulls || []).length} pulls from this season were added to your Binder Collection.</p>
      <div class="row-btns"><button class="btn primary" data-action="newRun">New season</button><button class="btn" data-action="openBinder" data-id="${run.charId}">View binder</button><button class="btn" data-action="frontOffice">Front Office (${F.Meta.data.rings} Rings)</button><button class="btn ghost" data-action="toTitle">Title screen</button></div>
    </main>`;
  };

  // ================= Title actions =================
  A.newRun = () => UI.go('select');
  // Save first so the season clock (and everything else) picks up exactly where you left off
  A.toTitle = () => { save(); UI.go('title'); };
  A.frontOffice = () => UI.go('frontOffice');
  A.continueRun = () => {
    F.run = F.Save.loadRun();
    if (!F.run) return UI.go('title');
    // Drop any cards that no longer exist in the game (e.g. removed in an update)
    F.run.deck = F.run.deck.filter(c => F.CARDS[c.id]);
    F.run.pulls = (F.run.pulls || []).filter(p => F.CARDS[p.id]);
    if (F.run.bestPull && !F.CARDS[F.run.bestPull.id]) F.run.bestPull = null;
    // 3PT Shooting and Mid-Range were merged into Shooting: keep the better of the two
    [F.run.stats, F.run.baseStats].forEach(s => {
      if (!s || s.SHO != null) return;
      s.SHO = Math.max(s['3PT'] || 0, s.MID || 0);
      delete s['3PT']; delete s.MID;
    });
    // Speed was removed
    [F.run.stats, F.run.baseStats].forEach(s => {
      if (s) delete s.SPD;
    });
    showMap();
  };
  A.selectChar = d => {
    // Starting over abandons the saved season: keep its play time
    const abandoned = F.Save.loadRun();
    if (abandoned) { F.Records.addPlaytime(F.Meta.data, abandoned); F.Meta.save(); }
    F.run = F.Run.create(d.id, F.Meta.data);
    save();
    showMap();
  };
  A.buyUpgrade = d => {
    const meta = F.Meta.data;
    const u = F.UPGRADES.find(x => x.id === d.id);
    const lvl = meta.upgrades[u.id] || 0;
    const cost = u.costs[lvl];
    if (cost == null || meta.rings < cost) return;
    meta.rings -= cost;
    meta.upgrades[u.id] = lvl + 1;
    F.Meta.save();
    UI.toast(`${u.name} upgraded.`);
    UI.render();
  };

  // ================= Dev tools (press ` to toggle) =================
  UI.renderDev = () => {
    const el = document.getElementById('dev');
    if (!UI.dev) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    const inRun = !!F.run;
    el.innerHTML = `<div class="dev-title">Dev tools <small>press \` to hide</small></div>
      <button data-action="dev" data-k="rings">+5 Rings</button>
      ${inRun ? `<button data-action="dev" data-k="bucks">+100 Bucks</button>
      <button data-action="dev" data-k="heal">Full Stamina</button>
      <button data-action="dev" data-k="stats">+1 all stats</button>
      <button data-action="dev" data-k="pack">Open Legends Pack</button>
      <button data-action="dev" data-k="item">Random memorabilia</button>
      ${UI.screen === 'combat' && F.combat && !F.combat.over ? '<button data-action="dev" data-k="win">Win this game</button><button data-action="dev" data-k="energy">+3 Energy</button>' : ''}
      ${UI.screen === 'map' && F.run.act < 7 ? '<button data-action="dev" data-k="skip">Skip to next month</button>' : ''}` : ''}`;
  };

  A.dev = d => {
    const run = F.run;
    switch (d.k) {
      case 'rings': F.Meta.data.rings += 5; F.Meta.save(); break;
      case 'bucks': run.bucks += 100; break;
      case 'heal': run.stamina = run.maxStamina; break;
      case 'stats': F.STATS.forEach(s => F.Run.addStat(run, s.key, 1)); break;
      case 'pack': save(); return A.openPack('legends', { title: 'Dev pack' });
      case 'item': { const a = F.Run.availableMemorabilia(run); if (a.length) F.Run.addMemorabilia(run, U.pick(a)); break; }
      case 'win': F.combat.you = F.combat.target; F.combat.over = 'win'; break;
      case 'energy': F.combat.energy += 3; break;
      case 'skip': {
        const fin = run.map.nodes.find(n => n.final);
        UI.node = fin;
        return completeNode();
      }
    }
    save();
    UI.render();
  };
})(FCD);
