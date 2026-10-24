// Hall of Fame records, kept forever per character.
// A "win" = winning the championship. A "loss" = any season that ends without one.
(function (F) {
  const Records = {};

  // Screens where the season clock runs
  Records.CLOCK_SCREENS = ['map', 'combat', 'reward', 'shop', 'practice', 'locker', 'treasure', 'event', 'monthEnd', 'series'];

  Records.forChar = (meta, charId) => {
    if (!meta.hof) meta.hof = {};
    if (!meta.hof[charId]) meta.hof[charId] = { playMs: 0, fastestWinMs: null, wins: 0, losses: 0, streak: 0, bestStreak: 0 };
    return meta.hof[charId];
  };

  // Called once when a season ends
  Records.recordSeason = (meta, run, won) => {
    const r = Records.forChar(meta, run.charId);
    const ms = run.playMs || 0;
    r.playMs += ms;
    if (won) {
      r.wins++;
      r.streak++;
      r.bestStreak = Math.max(r.bestStreak, r.streak);
      if (r.fastestWinMs == null || ms < r.fastestWinMs) r.fastestWinMs = ms;
    } else {
      r.losses++;
      r.streak = 0;
    }
  };

  // An abandoned season still counts toward play time
  Records.addPlaytime = (meta, run) => {
    Records.forChar(meta, run.charId).playMs += run.playMs || 0;
  };

  // 3723000 -> "1:02:03"
  Records.fmt = ms => {
    const s = Math.floor((ms || 0) / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  F.Records = Records;
})(FCD);
