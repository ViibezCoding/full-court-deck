// Binder Collection screens: pick a character, then flip through their binder.
(function (F) {
  const V = F.V;
  const S = F.Screens;
  const A = F.Actions;
  const UI = F.UI;
  const esc = s => F.U.esc(s);

  function progressBar(have, total) {
    const pct = total ? Math.round((have / total) * 100) : 0;
    return `<span class="b-bar"><i style="width:${pct}%"></i></span>`;
  }

  // ---------- Shelf of binders (one per character) ----------
  S.binder = () => {
    const meta = F.Meta.data;
    const covers = Object.keys(F.CHARACTERS).map(id => {
      const ch = F.CHARACTERS[id];
      const p = F.Binder.progress(meta, id);
      return `<button class="binder-cover" data-action="openBinder" data-id="${id}" style="--jersey:${ch.colors.jersey};--trim:${ch.colors.trim}">
        <span class="bc-rings" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="bc-label">Full Court Deck · Binder</span>
        ${V.rookieCard(id, null)}
        <span class="bc-name">${esc(ch.name)}</span>
        <span class="bc-stats">
          <span><b>${p.cardsHave}</b>/${p.cards} cards</span>
          <span><b>${p.serialsHave}</b>/${p.serials} serials</span>
          <span><b>${p.seasons}</b> season${p.seasons === 1 ? '' : 's'}</span>
        </span>
        ${progressBar(p.serialsHave, p.serials)}
      </button>`;
    }).join('');
    return `<main class="binder-screen">
      <div class="sel-head"><button class="btn ghost small" data-action="toTitle">Back</button><div><div class="eyebrow">Your collection</div><h2>Binder Collection</h2></div></div>
      <p class="fine">Every card you pull from a pack is added to that star's binder when the season ends, win or lose. Open a binder to see every card in the game.</p>
      <div class="binder-shelf">${covers}</div>
    </main>`;
  };

  // ---------- One character's binder ----------
  function pocket(fakeRun, cb, id) {
    const d = F.CARDS[id];
    const tiers = F.Binder.tiersFor(d);
    const entry = cb.cards[id] || {};
    const owned = tiers.filter(t => entry[t]);
    const best = owned.length ? Math.max(...owned) : tiers[0];
    const bestSerial = owned.length && entry[best].s.length ? entry[best].s[entry[best].s.length - 1] : 1;
    const rows = tiers.map(t => {
      const tier = F.TIERS[t];
      const e = entry[t];
      const starter = d.pool === 'starter';
      let val = e ? (starter ? 'Reached' : 'Pulled') : `<span class="pp-none">${starter ? 'Not reached' : 'Not pulled'}</span>`;
      // The 1 of 1 keeps a counter of how many times you've pulled it
      const counter = tier.print === 1 ? `<span class="pp-count ${e ? 'hot' : ''}">x${e ? e.n : 0}</span>` : '';
      return `<li class="${e ? 'have' : ''}"><span class="pp-tier t-${tier.key}">${tier.label}</span><span class="pp-val">${val}</span>${counter}</li>`;
    }).join('');
    const label = d.pool === 'starter' ? `${owned.length} of ${tiers.length} serials reached by upgrading` : d.pool === 'status' ? 'Not found in packs' : `${owned.length} of ${tiers.length} serials pulled`;
    return `<div class="pocket ${owned.length ? '' : 'empty'}" tabindex="0" role="button" data-action="zoomCard" data-id="${id}" data-char="${fakeRun.charId}" data-name="${esc(d.name.toLowerCase())}" aria-label="${esc(d.name)}: ${label}. Click to enlarge.">
      ${V.card(fakeRun, { id, tier: best, serial: bestSerial })}
      <div class="pk-pop">
        <div class="pp-name">${esc(d.name)}</div>
        <ul>${rows}</ul>
        <div class="pp-foot">${label}</div>
      </div>
    </div>`;
  }

  S.binderChar = ctx => {
    const meta = F.Meta.data;
    const ch = F.CHARACTERS[ctx.id];
    const cb = F.Binder.forChar(meta, ctx.id);
    const p = F.Binder.progress(meta, ctx.id);
    // Card numbers are shown using the Rookie Card's starting stats
    const fakeRun = { charId: ctx.id, stats: { ...ch.stats }, memorabilia: [] };
    const sections = F.Binder.sections(ctx.id).map(sec => {
      const have = sec.ids.filter(id => F.Binder.tiersFor(F.CARDS[id]).some(t => (cb.cards[id] || {})[t])).length;
      return `<section class="b-sec b-cards">
        <div class="b-sec-head"><h3>${esc(sec.title)}</h3><span>${have} of ${sec.ids.length} pulled</span></div>
        <div class="sheet">${sec.ids.map(id => pocket(fakeRun, cb, id)).join('')}</div>
      </section>`;
    }).join('');
    const items = Object.keys(F.MEMORABILIA).map(id => V.memoCard(id, { empty: !cb.items.includes(id) })).join('');
    return `<main class="binder-page" style="--jersey:${ch.colors.jersey};--trim:${ch.colors.trim}">
      <div class="sel-head"><button class="btn ghost small" data-action="toBinder">All binders</button><div><div class="eyebrow">${esc(ch.team)}</div><h2>${esc(ch.name)}'s Binder</h2></div></div>
      <div class="b-summary">
        <div><small>Cards pulled</small><b>${p.cardsHave}<span>/${p.cards}</span></b></div>
        <div><small>Serials pulled</small><b>${p.serialsHave}<span>/${p.serials}</span></b></div>
        <div><small>Memorabilia</small><b>${p.items}<span>/${p.itemsTotal}</span></b></div>
        <div><small>Seasons played</small><b>${p.seasons}</b></div>
      </div>
      <p class="fine">Hover over a card (or tap it) to see which serial tiers you've pulled, and how many times you've pulled its 1/1. Each card is shown at the rarest version you own. Faded cards haven't been pulled yet.</p>
      <div class="b-search"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.4 10.4 14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><input type="search" class="binder-search" placeholder="Search cards by name" aria-label="Search cards by name" autocomplete="off"><span class="b-search-count" aria-live="polite"></span></div>
      <p class="fine b-none" hidden>No cards match that name.</p>
      ${sections}
      <section class="b-sec b-memo">
        <div class="b-sec-head"><h3>Memorabilia</h3><span>${p.items} of ${p.itemsTotal} collected</span></div>
        <div class="memo-sheet">${items}</div>
      </section>
    </main>`;
  };

  // ---------- Search: filter the binder's cards by name as you type ----------
  function filterBinder(input) {
    const q = input.value.trim().toLowerCase();
    const page = input.closest('.binder-page');
    let shown = 0;
    page.querySelectorAll('.b-cards').forEach(sec => {
      let inSec = 0;
      sec.querySelectorAll('.pocket').forEach(p => {
        const hit = !q || p.dataset.name.includes(q);
        p.hidden = !hit;
        if (hit) inSec++;
      });
      sec.hidden = inSec === 0;
      shown += inSec;
    });
    page.querySelectorAll('.b-memo').forEach(s => { s.hidden = !!q; }); // memorabilia hides while searching
    page.querySelector('.b-none').hidden = !q || shown > 0;
    page.querySelector('.b-search-count').textContent = q ? `${shown} card${shown === 1 ? '' : 's'}` : '';
  }
  document.addEventListener('input', e => { if (e.target.matches && e.target.matches('.binder-search')) filterBinder(e.target); });

  // ---------- Enlarged card view (click a card in a binder) ----------
  F.Overlays.zoom = o => {
    const meta = F.Meta.data;
    const ch = F.CHARACTERS[o.charId];
    const d = F.CARDS[o.id];
    // A starting-deck card (from the "Choose your star" screen): just the Base card, no serial picker
    if (o.starter) {
      const run0 = { charId: o.charId, stats: { ...ch.stats }, memorabilia: [] };
      return `<div class="ov zoom-ov" data-action="closeOverlay"><div class="zoom-panel" data-action="noop">
        <div class="zoom-stage">${V.card(run0, { id: o.id, tier: 0, serial: 1 })}</div>
        <div class="zoom-info">
          <div class="eyebrow">${esc(ch.name)}'s starting deck</div>
          <h2>${esc(d.name)}</h2>
          <p class="fine">You start every season with ${o.n > 1 ? `${o.n} copies` : '1 copy'} of this card.</p>
          <button class="btn" data-action="closeOverlay">Close</button>
        </div>
      </div></div>`;
    }
    const cb = F.Binder.forChar(meta, o.charId);
    const entry = cb.cards[o.id] || {};
    const tiers = F.Binder.tiersFor(d);
    const owned = tiers.filter(t => entry[t]);
    const tier = o.tier != null ? o.tier : owned.length ? Math.max(...owned) : tiers[0];
    const e = entry[tier];
    const serial = e && e.s.length ? e.s[e.s.length - 1] : 1;
    const fakeRun = { charId: o.charId, stats: { ...ch.stats }, memorabilia: [] };
    const tabs = tiers.map(t => {
      const tt = F.TIERS[t];
      const have = !!entry[t];
      const count = tt.print === 1 && have ? ` x${entry[t].n}` : '';
      const starter = d.pool === 'starter';
      return `<button class="zt t-${tt.key} ${t === tier ? 'on' : ''} ${have ? 'have' : ''}" data-action="zoomTier" data-t="${t}" title="${have ? (starter ? 'Reached' : 'Pulled') : (starter ? 'Not reached yet' : 'Not pulled yet')}">${tt.label}${count}</button>`;
    }).join('');
    return `<div class="ov zoom-ov" data-action="closeOverlay"><div class="zoom-panel" data-action="noop">
      <div class="zoom-stage ${e ? '' : 'unpulled'}">${V.card(fakeRun, { id: o.id, tier, serial })}</div>
      <div class="zoom-info">
        <div class="eyebrow">${esc(ch.name)}'s Binder</div>
        <h2>${esc(d.name)}</h2>
        <p class="fine">${d.pool === 'starter'
          ? (e ? `You've upgraded this card to ${F.TIERS[tier].label}.` : `Upgrade this card to ${F.TIERS[tier].label} during a season to add it to your binder.`)
          : (e ? `You've pulled the ${F.TIERS[tier].label} version.` : `You haven't pulled the ${F.TIERS[tier].label} version yet.`)} Pick a serial to see that version.</p>
        <div class="zoom-tiers">${tabs}</div>
        <button class="btn" data-action="closeOverlay">Close</button>
      </div>
    </div></div>`;
  };
  A.zoomCard = d => UI.open('zoom', { id: d.id, charId: d.char, tier: null });
  A.zoomStarter = d => UI.open('zoom', { id: d.id, charId: d.char, starter: true, n: +d.n || 1 });
  A.zoomTier = d => { UI.overlay.tier = +d.t; UI.renderOverlay(); };
  A.noop = () => {};

  A.binder = () => UI.go('binder');
  A.toBinder = () => UI.go('binder');
  A.openBinder = d => UI.go('binderChar', { id: d.id });
})(FCD);
