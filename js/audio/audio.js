// ============================================================
// AUDIO: music and sound effects
// Everything is generated with code (Web Audio). These are
// placeholders: to use real music later, see README.md.
//
// FCD.Audio.sfx('swish')       play a sound effect
// FCD.Audio.unlock()           browsers only allow sound after a click
// Settings (music volume, effects volume, mute) are saved per browser.
// ============================================================
(function (F) {
  const Audio = {};
  let ctx = null;
  let master, musicBus, sfxBus, reverb, stadium, noiseBuf;
  let player = null;
  const SETTINGS_KEY = 'fcd_audio';

  // Default volumes (0 to 1). A player's own slider settings override these.
  Audio.settings = { music: 0.25, sfx: 0.5, muted: false };
  try { Object.assign(Audio.settings, JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}); } catch (e) { /* storage unavailable */ }
  const saveSettings = () => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(Audio.settings)); } catch (e) { /* storage unavailable */ } };

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function makeImpulse(seconds, power) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, power);
    }
    return ir;
  }

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master = ctx.createGain();
    master.connect(comp);
    comp.connect(ctx.destination);
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.connect(master);
    sfxBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(1.8, 3);
    reverb.connect(master);
    // Big, long echo for the stadium crowd
    stadium = ctx.createConvolver();
    stadium.buffer = makeImpulse(3.4, 2);
    stadium.connect(sfxBus);
    applyVolumes();
    return true;
  }

  function applyVolumes() {
    if (!ctx) return;
    const now = ctx.currentTime;
    master.gain.setTargetAtTime(Audio.settings.muted ? 0 : 1, now, 0.03);
    musicBus.gain.setTargetAtTime(Audio.settings.music, now, 0.03);
    sfxBus.gain.setTargetAtTime(Audio.settings.sfx, now, 0.03);
  }

  // ---------------- Building blocks ----------------
  const gainTo = d => { const g = ctx.createGain(); g.connect(d); return g; };
  const env = (g, t, a, peak, dec) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  };
  const osc = (type, f, t, stop) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(stop); return o; };
  const drive = k => { const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; };

  function noiseHit(t, d, type, freq, q, vol, dur, sweepTo) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    f.Q.value = q;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = gainTo(d);
    env(g, t, 0.003, vol, dur);
    s.connect(f); f.connect(g);
    s.start(t, Math.random() * 1.5);
    s.stop(t + dur + 0.05);
  }
  function kick(t, d, vol = 1) { const o = osc('sine', 160, t, t + 0.5); o.frequency.exponentialRampToValueAtTime(42, t + 0.13); const g = gainTo(d); env(g, t, 0.003, vol, 0.36); o.connect(g); }
  function snare(t, d, vol = 0.5) { noiseHit(t, d, 'highpass', 1800, 0.7, vol, 0.18); const o = osc('triangle', 190, t, t + 0.16); o.frequency.exponentialRampToValueAtTime(120, t + 0.1); const g = gainTo(d); env(g, t, 0.002, vol * 0.6, 0.12); o.connect(g); }
  function clap(t, d, vol = 0.4) { for (let i = 0; i < 3; i++) noiseHit(t + i * 0.012, d, 'bandpass', 1300, 1.2, vol, i === 2 ? 0.2 : 0.05); }
  function hat(t, d, vol = 0.12, open = false) { noiseHit(t, d, 'highpass', 8000, 0.7, vol, open ? 0.26 : 0.04); }
  // fromMidi: slide into the note from another pitch
  function b808(t, d, midi, len, vol = 0.55, fromMidi) {
    const f = mtof(midi), o = osc('sine', fromMidi ? mtof(fromMidi) : f * 1.6, t, t + len + 0.1);
    o.frequency.exponentialRampToValueAtTime(f, t + (fromMidi ? 0.18 : 0.06));
    const sh = ctx.createWaveShaper(); sh.curve = drive(2.5);
    const g = gainTo(d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.setValueAtTime(vol, t + len * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(sh); sh.connect(g);
  }
  function pluck(t, d, midi, len, type = 'triangle', vol = 0.2) { const o = osc(type, mtof(midi), t, t + len + 0.05); const g = gainTo(d); env(g, t, 0.004, vol, len); o.connect(g); }
  function pad(t, d, notes, len, vol = 0.04, cut = 1200) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut;
    const g = gainTo(d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.3);
    g.gain.setValueAtTime(vol, t + len - 0.3); g.gain.linearRampToValueAtTime(0, t + len);
    f.connect(g);
    notes.forEach(n => [-8, 8].forEach(dt => { const o = osc('sawtooth', mtof(n), t, t + len + 0.05); o.detune.value = dt; o.connect(f); }));
  }
  function brass(t, d, notes, len, vol = 0.07) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 2;
    f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(3400, t + 0.06); f.frequency.exponentialRampToValueAtTime(1100, t + len);
    const g = gainTo(d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    g.gain.setValueAtTime(vol, t + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    f.connect(g);
    notes.forEach(n => [-6, 6].forEach(dt => { const o = osc('sawtooth', mtof(n), t, t + len + 0.05); o.detune.value = dt; o.connect(f); }));
  }

  // ---------------- Stadium crowd ----------------
  // One cheering voice: a buzzy tone shaped into an "ahh" by two vowel filters
  function crowdVoice(t, d, len, energy) {
    const f0 = 130 + Math.random() * 230;
    const o = osc('sawtooth', f0 * 0.8, t, t + len + 0.1);
    o.frequency.linearRampToValueAtTime(f0 * (1.05 + Math.random() * 0.2 * energy), t + 0.3);
    o.frequency.linearRampToValueAtTime(f0 * 0.9, t + len);
    const lfo = osc('sine', 4 + Math.random() * 3, t, t + len), lg = ctx.createGain();
    lg.gain.value = f0 * 0.03; lfo.connect(lg); lg.connect(o.frequency);
    const g = gainTo(d);
    const peak = 0.03 * energy;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.15 + Math.random() * 0.15);
    g.gain.setValueAtTime(peak, t + len * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0005, t + len);
    const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 650 + Math.random() * 250; f1.Q.value = 5;
    const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1050 + Math.random() * 300; f2.Q.value = 7;
    const g2 = ctx.createGain(); g2.gain.value = 0.6;
    o.connect(f1); f1.connect(g);
    o.connect(f2); f2.connect(g2); g2.connect(g);
  }

  function whistle(t, d) {
    const o = osc('sine', 1800, t, t + 0.9);
    o.frequency.exponentialRampToValueAtTime(2900, t + 0.25);
    o.frequency.setValueAtTime(2900, t + 0.5);
    o.frequency.exponentialRampToValueAtTime(2300, t + 0.85);
    const g = gainTo(d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.025, t + 0.05);
    g.gain.setValueAtTime(0.025, t + 0.7); g.gain.linearRampToValueAtTime(0, t + 0.88);
    o.connect(g);
  }

  // A full stadium roar: rumble + many voices + claps + whistles + big echo
  function stadiumCrowd(t, d, len = 2.6, energy = 1) {
    const out = ctx.createGain(); out.connect(d);
    const send = ctx.createGain(); send.gain.value = 0.55; out.connect(send); send.connect(stadium);
    // Rumble of thousands of people
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 180;
    const rg = gainTo(out);
    rg.gain.setValueAtTime(0, t);
    rg.gain.linearRampToValueAtTime(0.2 * energy, t + 0.35);
    rg.gain.setValueAtTime(0.2 * energy, t + len * 0.5);
    rg.gain.exponentialRampToValueAtTime(0.0005, t + len);
    s.connect(lp); lp.connect(hp); hp.connect(rg);
    s.start(t, Math.random()); s.stop(t + len + 0.1);
    // Individual cheering voices
    for (let i = 0; i < 22; i++) {
      const st = t + Math.random() * 0.25;
      crowdVoice(st, out, Math.max(0.6, len - (st - t) - Math.random() * 0.5), energy);
    }
    // Scattered claps
    const claps = Math.round(len * 14);
    for (let i = 0; i < claps; i++) noiseHit(t + 0.2 + Math.random() * len * 0.7, out, 'bandpass', 1400 + Math.random() * 1400, 1.5, 0.06 + Math.random() * 0.08, 0.025);
    // A couple of whistles
    whistle(t + 0.15 + Math.random() * 0.4, out);
    if (energy >= 1) whistle(t + 0.5 + Math.random() * 0.5, out);
  }

  // ---------------- Sound effects ----------------
  const SFX = {
    click(t, d) { const o = osc('square', 1300, t, t + 0.05); o.frequency.exponentialRampToValueAtTime(700, t + 0.04); const g = gainTo(d); env(g, t, 0.001, 0.06, 0.04); o.connect(g); },
    cardPlay(t, d) { noiseHit(t, d, 'bandpass', 500, 1.4, 0.35, 0.2, 3200); SFX.click(t + 0.17, d); },
    dribble(t, d) {
      [0, 0.32, 0.64].forEach((dt, i) => {
        const tt = t + dt, o = osc('sine', 140, tt, tt + 0.15);
        o.frequency.exponentialRampToValueAtTime(60, tt + 0.09);
        const g = gainTo(d); env(g, tt, 0.002, 0.7 - i * 0.1, 0.12); o.connect(g);
        noiseHit(tt, d, 'bandpass', 900, 1, 0.18, 0.04);
      });
    },
    swish(t, d) { noiseHit(t, d, 'bandpass', 4200, 1.1, 0.3, 0.32, 1300); noiseHit(t + 0.22, d, 'highpass', 5000, 0.5, 0.08, 0.25); },
    three(t, d) { SFX.swish(t, d); stadiumCrowd(t + 0.2, d, 2.2, 1.1); },
    block(t, d) {
      const o = osc('sine', 110, t, t + 0.25); o.frequency.exponentialRampToValueAtTime(45, t + 0.15);
      const g = gainTo(d); env(g, t, 0.002, 1, 0.2); o.connect(g);
      noiseHit(t, d, 'bandpass', 900, 1.2, 0.6, 0.09);
      noiseHit(t + 0.015, d, 'highpass', 2500, 0.7, 0.25, 0.05);
    },
    buzzer(t, d) {
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1900;
      const g = gainTo(d);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.14, t + 0.01);
      g.gain.setValueAtTime(0.14, t + 1.05); g.gain.linearRampToValueAtTime(0, t + 1.1);
      f.connect(g);
      [210, 213.5, 420].forEach(fr => osc('square', fr, t, t + 1.15).connect(f));
    },
    crowd(t, d) { stadiumCrowd(t, d, 2.8, 1); },
    packRip(t, d) {
      for (let i = 0; i < 16; i++) noiseHit(t + i * 0.022 + Math.random() * 0.01, d, 'bandpass', 2200 + Math.random() * 2600, 2, 0.25 + Math.random() * 0.2, 0.035);
      noiseHit(t, d, 'highpass', 1200, 0.7, 0.15, 0.4, 6000);
    },
    rarePull(t, d) {
      [84, 88, 91, 96, 100, 103].forEach((n, i) => pluck(t + i * 0.065, d, n, 0.7, 'sine', 0.09));
      [96, 103, 108].forEach((n, i) => pluck(t + 0.45 + i * 0.09, d, n, 1.2, 'triangle', 0.04));
      pad(t, d, [72, 76, 79], 1.6, 0.03, 2400);
    },
    bucks(t, d) { pluck(t, d, 88, 0.12, 'square', 0.05); pluck(t + 0.08, d, 93, 0.5, 'square', 0.05); },

    // ---- Pack opening show ----
    // Foil crinkling while the pack shakes, with tension building up
    crinkle(t, d) {
      for (let i = 0; i < 26; i++) {
        const tt = t + Math.pow(i / 26, 0.8) * 0.85;
        noiseHit(tt, d, 'highpass', 3500 + Math.random() * 3500, 0.8, 0.05 + (i / 26) * 0.12, 0.02 + Math.random() * 0.03);
      }
      riser(t, d, 0.9, 0.09);
      const o = osc('sine', 70, t, t + 0.95); o.frequency.exponentialRampToValueAtTime(130, t + 0.9);
      const g = gainTo(d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.85); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.95); o.connect(g);
    },
    // The top tears off: rip + boom + sparkle
    tear(t, d) {
      SFX.packRip(t, d);
      kick(t + 0.38, d, 0.9);
      noiseHit(t + 0.38, d, 'lowpass', 900, 0.7, 0.35, 0.5, 120);
      crash(t + 0.4, d, 0.07);
      [96, 100, 103, 108].forEach((n, i) => pluck(t + 0.42 + i * 0.04, d, n, 0.5, 'sine', 0.04));
    },
    // Cards sliding out of the pack
    deal(t, d) { for (let i = 0; i < 5; i++) noiseHit(t + i * 0.1, d, 'bandpass', 2600, 1.3, 0.12, 0.09, 900); },
    // One card flipping over
    flip(t, d) { noiseHit(t, d, 'bandpass', 1800, 1.6, 0.22, 0.07, 4200); SFX.click(t + 0.05, d); },
    ding1(t, d) { pluck(t + 0.04, d, 88, 0.5, 'sine', 0.08); },
    ding2(t, d) { pluck(t + 0.04, d, 91, 0.4, 'sine', 0.08); pluck(t + 0.12, d, 96, 0.6, 'sine', 0.07); },
    // A big card is about to flip: rising shimmer + drum roll
    tease(t, d) {
      riser(t, d, 0.6, 0.1);
      for (let i = 0; i < 10; i++) snare(t + i * 0.055, d, 0.06 + i * 0.012);
    },
    cheer(t, d) { stadiumCrowd(t, d, 1.8, 0.75); },
    // Showtime comic card: POW!
    pow(t, d) {
      kick(t, d, 1);
      noiseHit(t, d, 'bandpass', 1200, 0.8, 0.5, 0.18, 300);
      brass(t + 0.02, d, [67, 71, 74, 79], 0.35, 0.08);
    },
    // A 1/1!
    jackpot(t, d) {
      kick(t, d, 1); crash(t, d, 0.12);
      [[72, 76, 79], [74, 77, 81], [76, 79, 84]].forEach((c, i) => brass(t + i * 0.13, d, c, 0.12, 0.09));
      brass(t + 0.39, d, [72, 76, 79, 84, 88], 1.4, 0.1);
      SFX.rarePull(t + 0.3, d);
      stadiumCrowd(t + 0.25, d, 3.2, 1.25);
    },
    // Autograph hit slams down
    autoSlam(t, d) {
      kick(t, d, 1); clap(t, d, 0.5);
      noiseHit(t, d, 'lowpass', 600, 0.7, 0.4, 0.35, 90);
      brass(t + 0.05, d, [65, 69, 72, 77], 0.7, 0.09);
      [89, 93, 96, 101].forEach((n, i) => pluck(t + 0.15 + i * 0.06, d, n, 0.7, 'sine', 0.06));
      stadiumCrowd(t + 0.15, d, 2.2, 0.9);
    },
    win(t, d) {
      [[60, 64, 67], [64, 67, 72], [67, 72, 76]].forEach((c, i) => brass(t + i * 0.15, d, c, 0.14, 0.08));
      brass(t + 0.45, d, [72, 76, 79, 84], 1.1, 0.09);
      kick(t + 0.45, d, 0.6);
    },
    loss(t, d) {
      [58, 57, 56].forEach((n, i) => {
        const tt = t + i * 0.42, o = osc('sawtooth', mtof(n), tt, tt + 0.4);
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
        const g = gainTo(d); env(g, tt, 0.03, 0.08, 0.36); o.connect(f); f.connect(g);
      });
      const tt = t + 1.26, o = osc('sawtooth', mtof(55), tt, tt + 1.2);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
      const l = osc('sine', 6, tt, tt + 1.2), lg = ctx.createGain(); lg.gain.value = 7; l.connect(lg); lg.connect(o.frequency);
      const g = gainTo(d);
      g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.08, tt + 0.04);
      g.gain.setValueAtTime(0.08, tt + 0.8); g.gain.exponentialRampToValueAtTime(0.0001, tt + 1.15);
      o.connect(f); f.connect(g);
    },
  };

  // ---------------- More instruments for the songs ----------------
  function crash(t, d, vol = 0.1) { noiseHit(t, d, 'highpass', 5000, 0.5, vol, 1.4); }
  function riser(t, d, len, vol = 0.12) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2;
    f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(7000, t + len);
    const g = gainTo(d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + len);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.05);
    s.connect(f); f.connect(g); s.start(t); s.stop(t + len + 0.1);
  }
  function lead(t, d, midi, len, vol = 0.045, cut = 2600, type = 'sawtooth') {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 3;
    f.frequency.setValueAtTime(cut, t); f.frequency.exponentialRampToValueAtTime(cut * 0.45, t + len);
    const g = gainTo(d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.setValueAtTime(vol, t + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + len); f.connect(g);
    [-7, 7].forEach(dt => { const o = osc(type, mtof(midi), t, t + len + 0.05); o.detune.value = dt; o.connect(f); });
  }
  function keys(t, d, notes, len, vol = 0.06) {
    const g = gainTo(d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(vol * 0.35, t + 0.7);
    g.gain.setValueAtTime(vol * 0.35, t + Math.max(0.75, len - 0.25)); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    notes.forEach(n => {
      osc('sine', mtof(n), t, t + len + 0.05).connect(g);
      const o2 = osc('triangle', mtof(n) * 2, t, t + len + 0.05), g2 = ctx.createGain(); g2.gain.value = 0.12; o2.connect(g2); g2.connect(g);
    });
  }
  // Gang-vocal "HEY!"
  function hey(t, d, vol = 0.09) {
    [180, 215, 250].forEach((f0, i) => {
      const o = osc('sawtooth', f0, t, t + 0.3); o.frequency.exponentialRampToValueAtTime(f0 * 0.78, t + 0.25);
      const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 650 + i * 40; f1.Q.value = 6;
      const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1700 + i * 60; f2.Q.value = 8;
      const g = gainTo(d); env(g, t + i * 0.008, 0.01, vol, 0.22);
      o.connect(f1); f1.connect(g); o.connect(f2); f2.connect(g);
    });
    noiseHit(t, d, 'bandpass', 2500, 1, vol * 0.8, 0.06);
  }
  // Record scratch
  function scratch(t, d, vol = 0.25) { noiseHit(t, d, 'bandpass', 700, 4, vol, 0.09, 3200); noiseHit(t + 0.09, d, 'bandpass', 3000, 4, vol, 0.08, 600); }
  function crackle(t, d, sd) { if (Math.random() < 0.35) noiseHit(t + Math.random() * sd, d, 'highpass', 3000, 0.5, 0.025, 0.008); }

  // Instruments the songs in js/audio/songs.js can use
  Audio.inst = { kick, snare, clap, hat, b808, pluck, pad, brass, crash, riser, lead, keys, hey, scratch, crackle };

  // ---------------- Music: shuffled playlist ----------------
  // Songs play one after another in a random order. When every song has played,
  // the order is reshuffled (never repeating the song that just ended).
  let order = [];
  function nextSongIndex(last) {
    if (!order.length) {
      const all = F.SONGS.map((_, i) => i);
      for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
      if (all.length > 1 && all[0] === last) all.push(all.shift());
      order = all;
    }
    return order.shift();
  }

  // Each song gets its own output so the old one can fade while the new one starts
  function songBus(song) {
    const bus = ctx.createGain();
    let out = bus;
    if (song.lowpass) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = song.lowpass; bus.connect(f); out = f; }
    out.connect(musicBus);
    const send = ctx.createGain(); send.gain.value = song.reverb || 0.12; out.connect(send); send.connect(reverb);
    return bus;
  }

  function startSong(index, at) {
    const song = F.SONGS[index];
    if (player.bus) { const old = player.bus; old.gain.setTargetAtTime(0, at, 0.4); setTimeout(() => old.disconnect(), 4000); }
    player.index = index;
    player.bus = songBus(song);
    player.bus.gain.setValueAtTime(0, at);
    player.bus.gain.linearRampToValueAtTime(1, at + 1.5);
    player.step = 0;
  }

  function startMusic() {
    if (!ctx || player || !F.SONGS || !F.SONGS.length) return;
    player = { index: -1, bus: null, step: 0, next: ctx.currentTime + 0.1 };
    startSong(nextSongIndex(-1), player.next);
    player.timer = setInterval(tick, 25);
  }

  function tick() {
    if (!player || ctx.state !== 'running') return;
    if (player.next < ctx.currentTime) player.next = ctx.currentTime + 0.05; // skip ahead after a pause
    while (player.next < ctx.currentTime + 0.15) {
      let song = F.SONGS[player.index];
      if (player.step >= song.bars * 16) { startSong(nextSongIndex(player.index), player.next); song = F.SONGS[player.index]; }
      const sd = 60 / song.bpm / 4;
      const st = player.step % 16;
      const t = player.next + (st % 2 === 1 ? (song.swing || 0) * sd : 0);
      song.play(st, Math.floor(player.step / 16), t, sd, player.bus);
      player.step++;
      player.next += sd;
    }
  }

  // Used by the automated tests
  Audio.pickNextSong = nextSongIndex;
  Audio.testOutput = () => musicBus;

  // Name of the song playing right now (handy for testing)
  Audio.nowPlaying = () => (player && F.SONGS[player.index] ? F.SONGS[player.index].name : null);

  // ---------------- Public ----------------
  // Call on the first click: browsers only allow sound after the player interacts
  Audio.unlock = () => {
    if (!init()) return;
    if (ctx.state === 'suspended') ctx.resume();
    startMusic();
  };

  Audio.sfx = (name, delay = 0) => {
    if (!ctx || ctx.state !== 'running' || Audio.settings.muted || !SFX[name]) return;
    const d = ctx.createGain();
    d.connect(sfxBus);
    const send = ctx.createGain(); send.gain.value = 0.12; d.connect(send); send.connect(reverb);
    SFX[name](ctx.currentTime + 0.02 + delay, d);
    setTimeout(() => d.disconnect(), (delay + 6) * 1000);
  };

  Audio.set = (key, value) => {
    Audio.settings[key] = value;
    saveSettings();
    applyVolumes();
  };

  // Pause everything when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });

  F.Audio = Audio;
})(FCD);
