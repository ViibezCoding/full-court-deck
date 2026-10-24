// ============================================================
// SONGS: the game's music playlist (about 1 minute each)
// The game plays these in a shuffled order. To add a song, copy one
// of these, change it, and add it to the list.
//
//   bpm:      speed (beats per minute)
//   bars:     length. Seconds = bars x 4 x 60 / bpm
//   sections: which bars are intro / verse / hook / break / outro
//   swing:    0 = straight, 0.2+ = laid-back "boom bap" feel
//   play():   called 16 times per bar (st = 0..15) to play notes
//
// Instruments come from js/audio/audio.js (FCD.Audio.inst).
// ============================================================
(function (F) {
  const I = () => F.Audio.inst;
  const sec = (song, bar) => song.sections.find(s => bar >= s.from && bar <= s.to).name;
  // Crash cymbal on the first beat of each new verse or hook
  const newSection = (song, bar, st) => st === 0 && song.sections.some(s => s.from === bar && (s.name === 'verse' || s.name === 'hook') && bar > 0);
  // How many steps a melody note should hold (until the next note, max 4)
  const hold = (mel, st) => { let n = 1; while (st + n < 16 && !mel[st + n] && n < 4) n++; return n; };

  F.SONGS = [
    {
      name: 'Warm-Up', bpm: 140, bars: 35, reverb: 0.12, // 1:00
      sections: [
        { name: 'intro', from: 0, to: 3 }, { name: 'verse', from: 4, to: 11 }, { name: 'hook', from: 12, to: 19 },
        { name: 'break', from: 20, to: 21 }, { name: 'verse', from: 22, to: 27 }, { name: 'hook', from: 28, to: 34 },
      ],
      chords: [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]], roots: [33, 29, 26, 28], bell: { 0: 0, 3: 1, 6: 2, 8: 1, 11: 0, 14: 2 },
      mel: [[76,0,0,0,72,0,74,0,76,0,0,0,79,0,76,0],[77,0,0,0,72,0,74,0,72,0,0,0,69,0,0,0],[74,0,0,0,77,0,76,0,74,0,0,0,72,0,74,0],[76,0,0,0,71,0,0,0,68,0,71,0,76,0,0,0]],
      play(st, bar, t, sd, d) {
        const { kick, snare, clap, hat, b808, pluck, pad, crash, riser, lead } = I();
        const b = bar % 4, ch = this.chords[b], r = this.roots[b], s = sec(this, bar);
        if (st === 0) pad(t, d, ch, sd * 16, 0.03, 1000);
        if (st in this.bell) pluck(t, d, ch[this.bell[st]] + 24, sd * 3, 'sine', 0.07);
        if (s === 'intro') { if (bar >= 2 && st % 2 === 0) hat(t, d, 0.07); if (bar === 3 && st === 0) riser(t, d, sd * 16); return; }
        if (s === 'break') { if (bar === 21 && st >= 12) clap(t, d, 0.15 + (st - 12) * 0.07); return; }
        if (newSection(this, bar, st)) crash(t, d);
        if (st === 0 || st === 7 || st === 10 || (b === 3 && st === 14)) { kick(t, d, 0.9); b808(t, d, r + 12, sd * (st === 0 ? 6 : 3)); }
        if (st === 8) { clap(t, d, 0.42); snare(t, d, 0.3); }
        if (st % 2 === 0) hat(t, d, 0.11);
        if ((b === 1 || b === 3) && st >= 12) { hat(t, d, 0.08); hat(t + sd / 2, d, 0.07); }
        if (s === 'hook') {
          if (st === 14) hat(t, d, 0.08, true);
          const m = this.mel[b][st]; if (m) lead(t, d, m, sd * hold(this.mel[b], st) * 0.95, 0.04);
        }
      },
    },
    {
      name: 'Night Game', bpm: 145, bars: 36, reverb: 0.16, // 0:60
      sections: [
        { name: 'intro', from: 0, to: 3 }, { name: 'verse', from: 4, to: 11 }, { name: 'hook', from: 12, to: 19 },
        { name: 'break', from: 20, to: 23 }, { name: 'verse', from: 24, to: 27 }, { name: 'hook', from: 28, to: 35 },
      ],
      chords: [[60, 63, 67], [60, 63, 67], [56, 60, 63], [55, 59, 62]], roots: [36, 36, 32, 31],
      arp: [0, 1, 2, 1, 0, 2, 1, 2, 0, 1, 2, 1, 2, 1, 0, 1],
      mel: [[72,0,0,75,0,0,79,0,77,0,75,0,72,0,0,0],[72,0,0,75,0,0,79,0,80,0,79,0,77,0,75,0],[75,0,0,77,0,0,79,0,80,0,0,0,79,0,0,0],[77,0,0,0,74,0,0,0,71,0,74,0,77,0,0,0]],
      play(st, bar, t, sd, d) {
        const { kick, snare, clap, hat, b808, pluck, pad, crash, riser, lead } = I();
        const b = bar % 4, ch = this.chords[b], r = this.roots[b], s = sec(this, bar);
        pluck(t, d, ch[this.arp[st]] + (st >= 8 && st % 2 ? 24 : 12), sd * 0.9, 'triangle', s === 'intro' ? 0.045 : 0.06);
        if (st === 0 && (s === 'intro' || s === 'break')) pad(t, d, ch, sd * 16, 0.028, 900);
        if (s === 'intro') { if (bar === 3 && st === 0) riser(t, d, sd * 16); return; }
        if (s === 'break') {
          if (st % 4 === 0) hat(t, d, 0.07);
          if (bar === 23 && st >= 8) snare(t, d, 0.12 + (st - 8) * 0.04);
          return;
        }
        if (newSection(this, bar, st)) crash(t, d);
        if (st === 0) { kick(t, d); b808(t, d, r, sd * 7, 0.55, r + 7); }
        if (st === 3 || st === 10 || (bar % 2 && st === 14)) { kick(t, d, 0.85); b808(t, d, r, sd * 3); }
        if (st === 8) { snare(t, d, 0.45); if (s === 'hook') clap(t, d, 0.3); }
        if (st % 2 === 0) hat(t, d, 0.1);
        if (b === 3 && st >= 12) { for (let k = 0; k < 3; k++) hat(t + k * sd * 2 / 3, d, 0.07); }
        if (s === 'hook') {
          if (st === 14) hat(t, d, 0.08, true);
          const m = this.mel[b][st]; if (m) lead(t, d, m, sd * hold(this.mel[b], st) * 0.9, 0.04, 2200, 'square');
        }
      },
    },
    {
      name: 'Shootaround', bpm: 92, bars: 23, swing: 0.22, reverb: 0.22, lowpass: 3400, // 1:00
      sections: [
        { name: 'intro', from: 0, to: 1 }, { name: 'verse', from: 2, to: 9 }, { name: 'hook', from: 10, to: 15 },
        { name: 'verse', from: 16, to: 17 }, { name: 'hook', from: 18, to: 21 }, { name: 'outro', from: 22, to: 22 },
      ],
      chords: [[62, 65, 69, 72], [59, 65, 67, 71], [60, 64, 67, 71], [57, 61, 64, 67]], roots: [38, 43, 36, 45],
      play(st, bar, t, sd, d) {
        const { kick, snare, hat, pluck, keys, brass, scratch, crackle } = I();
        const b = bar % 4, ch = this.chords[b], r = this.roots[b], s = sec(this, bar);
        crackle(t, d, sd);
        if (s === 'intro' || s === 'outro') {
          if (st === 0) keys(t, d, ch, sd * 16, 0.06);
          if (st === 8) keys(t, d, ch.map(n => n + 12), sd * 6, 0.025);
          return;
        }
        if (st === 0 || st === 7 || st === 10) kick(t, d, st === 0 ? 1 : 0.8);
        if (st === 4 || st === 12) snare(t, d, 0.55);
        if (st % 2 === 0) hat(t, d, st % 4 === 0 ? 0.08 : 0.05);
        if (st === 0) pluck(t, d, r, sd * 6, 'triangle', 0.34);
        if (st === 10) pluck(t, d, r + 7, sd * 4, 'triangle', 0.3);
        if (st === 14) pluck(t, d, r + 12, sd * 2, 'triangle', 0.26);
        if (st === 0) keys(t, d, ch, sd * 5, 0.05);
        if (st === 6) keys(t, d, ch, sd * 3, 0.035);
        if (s === 'hook') {
          if (st === 0 || st === 10) brass(t, d, ch.slice(0, 3).map(n => n + 12), sd * 1.6, 0.055);
          if (b % 2 === 1 && (st === 12 || st === 14)) scratch(t, d);
        }
      },
    },
    {
      name: 'Fast Break', bpm: 150, bars: 37, reverb: 0.1, // 0:59
      sections: [
        { name: 'intro', from: 0, to: 3 }, { name: 'verse', from: 4, to: 11 }, { name: 'hook', from: 12, to: 19 },
        { name: 'break', from: 20, to: 23 }, { name: 'hook', from: 24, to: 31 }, { name: 'verse', from: 32, to: 36 },
      ],
      chords: [[65, 69, 72], [62, 65, 69], [58, 62, 65], [60, 64, 67]], roots: [29, 26, 34, 24],
      play(st, bar, t, sd, d) {
        const { kick, snare, clap, hat, b808, pluck, brass, crash, riser, hey } = I();
        const b = bar % 4, ch = this.chords[b], r = this.roots[b], s = sec(this, bar);
        if (s === 'intro') {
          if (b % 2 === 0 && (st === 0 || st === 3)) brass(t, d, ch.map(n => n + 12), sd * 1.2, 0.06);
          if (st === 4 || st === 12) clap(t, d, 0.35);
          if (bar === 3 && st === 0) riser(t, d, sd * 16);
          return;
        }
        if (s === 'break') {
          if (st === 4 || st === 12) clap(t, d, 0.3);
          if (st === 0 || st === 6 || st === 10) b808(t, d, r + 12, sd * 2, 0.45);
          if (bar === 23 && st === 0) riser(t, d, sd * 16);
          return;
        }
        if (newSection(this, bar, st)) crash(t, d);
        if (st === 0 || st === 6 || st === 10) { kick(t, d, 0.95); b808(t, d, r + 12, sd * 2, 0.5); }
        if (st === 4 || st === 12) { clap(t, d, 0.4); snare(t, d, 0.25); }
        hat(t, d, st % 2 ? 0.05 : 0.09);
        const bell = { 0: 2, 3: 1, 6: 0, 10: 1, 12: 2 };
        if (st in bell) pluck(t, d, ch[bell[st]] + 12, sd * 1.5, 'square', 0.03);
        if (s === 'hook') {
          if (st === 0 || st === 3 || st === 6) brass(t, d, ch.map(n => n + 12), sd * 1.2, 0.06);
          if (st === 10) brass(t, d, ch.map(n => n + 12), sd * 3, 0.06);
          if (b % 2 === 1 && st === 12) hey(t, d);
        }
      },
    },
    {
      name: 'Victory Lap', bpm: 130, bars: 32, reverb: 0.2, // 0:59
      sections: [
        { name: 'intro', from: 0, to: 3 }, { name: 'verse', from: 4, to: 11 }, { name: 'hook', from: 12, to: 19 },
        { name: 'verse', from: 20, to: 23 }, { name: 'hook', from: 24, to: 27 }, { name: 'outro', from: 28, to: 31 },
      ],
      chords: [[67, 71, 74], [62, 66, 69], [64, 67, 71], [60, 64, 67]], roots: [31, 26, 28, 24],
      mel: [[79,0,0,0,78,0,79,0,81,0,0,0,79,0,74,0],[74,0,0,0,0,0,76,0,78,0,0,0,76,0,74,0],[76,0,0,0,79,0,0,0,83,0,81,0,79,0,76,0],[76,0,0,0,74,0,72,0,74,0,0,0,0,0,0,0]],
      play(st, bar, t, sd, d) {
        const { kick, snare, clap, hat, b808, pluck, pad, crash, riser, lead, hey } = I();
        const b = bar % 4, ch = this.chords[b], r = this.roots[b], s = sec(this, bar);
        if (st === 0) pad(t, d, ch, sd * 16, 0.035, s === 'hook' ? 1800 : 1200);
        const m = this.mel[b][st];
        if (s === 'intro') {
          if (m) lead(t, d, m, sd * hold(this.mel[b], st) * 0.9, 0.03, 1200);
          if (bar >= 2 && st % 4 === 2) hat(t, d, 0.07);
          if (bar === 3 && st === 0) riser(t, d, sd * 16);
          return;
        }
        if (s === 'outro') {
          if (m) lead(t, d, m, sd * hold(this.mel[b], st) * 0.9, 0.03, 1400);
          if (st === 0 && bar < this.bars - 1) kick(t, d, 0.7);
          return;
        }
        if (newSection(this, bar, st)) crash(t, d);
        if (st === 0 || st === 8 || st === 11) kick(t, d, 0.95);
        if (st === 0) b808(t, d, r + 12, sd * 7, 0.5);
        if (st === 8) b808(t, d, r + 12, sd * 6, 0.45);
        if (st === 4 || st === 12) { snare(t, d, 0.4); clap(t, d, 0.3); }
        if (st % 2 === 0) hat(t, d, 0.09);
        if (st % 4 === 0) pluck(t, d, ch[(st / 4) % 3] + 12, sd * 2, 'triangle', 0.05);
        if (s === 'hook') {
          if (m) lead(t, d, m, sd * hold(this.mel[b], st) * 0.9, 0.045, 3000);
          if (st % 4 === 2) hat(t, d, 0.06, true);
          if (b % 2 === 1 && (st === 4 || st === 12)) hey(t, d, 0.08);
        }
      },
    },
  ];
})(FCD);
