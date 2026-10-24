// Hall of Fame: lifetime records for each star.
(function (F) {
  const S = F.Screens;
  const A = F.Actions;
  const esc = s => F.U.esc(s);

  const ICONS = {
    clock: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="16" y="2" width="8" height="5" rx="1.5" fill="var(--trim)"/><circle cx="20" cy="22" r="15" fill="var(--trim)"/><circle cx="20" cy="22" r="11.5" fill="#1b2235"/><path d="M20 14v8h7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trophy: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M11 5h18v9a9 9 0 01-18 0z" fill="#E8B33C"/><path d="M11 8H5c0 7 3 10 7 10M29 8h6c0 7-3 10-7 10" stroke="#E8B33C" stroke-width="3" fill="none"/><rect x="17" y="22" width="6" height="8" fill="#E8B33C"/><rect x="11" y="30" width="18" height="6" rx="1.5" fill="#b9861f"/></svg>',
    streak: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3c3 8 11 10 11 20a11 11 0 01-22 0c0-5 3-8 5-10 0 4 2 7 4 7-1-7 0-12 2-17z" fill="#F26A1B"/><path d="M20 20c2 4 6 5 6 10a6 6 0 01-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3 0-5 1-7z" fill="#ffd27a"/></svg>',
  };

  function row(icon, lines) {
    return `<div class="hof-row"><span class="hof-icon">${ICONS[icon]}</span><div class="hof-lines">${lines.map(([label, value, cls]) => `<div><span class="hof-label">${label}</span> <b class="${cls || ''}">${value}</b></div>`).join('')}</div></div>`;
  }

  S.hallOfFame = () => {
    const meta = F.Meta.data;
    const panels = Object.keys(F.CHARACTERS).map(id => {
      const ch = F.CHARACTERS[id];
      const r = F.Records.forChar(meta, id);
      const total = r.wins + r.losses;
      return `<article class="hof-panel" style="--jersey:${ch.colors.jersey};--trim:${ch.colors.trim}">
        <header class="hof-head">
          <span class="hc-num" style="background:${ch.colors.jersey};color:${ch.colors.trim}">${ch.number}</span>
          <div><div class="eyebrow">${esc(ch.team)}</div><h3>${esc(ch.name)}</h3></div>
          <span class="hof-seasons">${total} season${total === 1 ? '' : 's'}</span>
        </header>
        ${row('clock', [['Total playtime', F.Records.fmt(r.playMs), 'time'], ['Fastest win', r.fastestWinMs == null ? 'None yet' : F.Records.fmt(r.fastestWinMs), 'time']])}
        ${row('trophy', [['Championships', `<span class="w">${r.wins} ${r.wins === 1 ? 'Win' : 'Wins'}</span> <span class="l">${r.losses} ${r.losses === 1 ? 'Loss' : 'Losses'}</span>`]])}
        ${row('streak', [['Current win streak', r.streak, 'num'], ['Best win streak', r.bestStreak, 'num']])}
      </article>`;
    }).join('');
    return `<main class="hof-screen">
      <div class="sel-head"><button class="btn ghost small" data-action="toTitle">Back</button><div><div class="eyebrow">Lifetime records</div><h2>Hall of Fame</h2></div></div>
      <p class="fine">A win means winning the championship. Any season that ends before that counts as a loss. Win streaks count championships in a row with the same star.</p>
      <div class="hof-grid">${panels}</div>
    </main>`;
  };

  A.hallOfFame = () => F.UI.go('hallOfFame');
})(FCD);
