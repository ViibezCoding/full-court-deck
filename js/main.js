// Starts the game and wires up clicks and keyboard shortcuts.
(function (F) {
  const UI = F.UI;

  function boot() {
    F.Meta.load();
    F.run = null;
    F.combat = null;

    // Browsers only allow sound after the player clicks or presses a key
    document.addEventListener('pointerdown', () => F.Audio.unlock());
    document.addEventListener('keydown', () => F.Audio.unlock());

    // Every button with data-action="something" calls F.Actions.something
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-action]');
      if (!el || el.disabled) return;
      const name = el.dataset.action;
      const fn = F.Actions[name];
      const before = UI.screen;
      if (fn) fn(el.dataset, el);
      actionSound(name, before);
    });

    // Volume sliders in the Sound settings
    document.addEventListener('input', e => {
      const key = e.target.dataset && e.target.dataset.audio;
      if (key) F.Audio.set(key, +e.target.value / 100);
    });

    document.addEventListener('keydown', e => {
      if (e.target.matches && e.target.matches('input, textarea')) return; // typing in a text box (e.g. Binder search)
      if (e.key === '`') { UI.dev = !UI.dev; UI.renderDev(); return; }
      if (e.key === 'Escape' && UI.overlay && ['deck', 'rookie', 'pile', 'sound', 'zoom'].includes(UI.overlay.kind)) { UI.close(); return; }
      // Enter or Space on a focused binder card opens it
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role="button"][data-action]')) { e.preventDefault(); e.target.click(); return; }
      if (UI.screen !== 'combat' || UI.overlay || !F.combat || F.combat.over) return;
      if (e.key === 'e' || e.key === 'E') { F.Actions.endTurn(); return; }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9 && F.combat.hand[n - 1]) F.Actions.play({ i: String(n - 1) });
    });

    // Season clock: counts while you're on a season screen and the tab is visible
    let last = Date.now();
    let ticks = 0;
    setInterval(() => {
      const now = Date.now();
      const dt = Math.min(now - last, 5000);
      last = now;
      if (!F.run || document.visibilityState !== 'visible' || !F.Records.CLOCK_SCREENS.includes(UI.screen)) return;
      F.run.playMs = (F.run.playMs || 0) + dt;
      document.querySelectorAll(".hud-timer b").forEach(el => { el.textContent = F.Records.fmt(F.run.playMs); });
      if (++ticks % 15 === 0) F.Save.saveRun(F.run);
    }, 1000);
    // Closing or hiding the tab: save so the season clock only pauses, never rolls back
    const saveNow = () => { if (F.run) F.Save.saveRun(F.run); };
    window.addEventListener("pagehide", saveNow);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") saveNow(); });

    UI.go('title');
  }

  // Sound effects for buttons (game cards and turns play their own sounds in combat-view.js)
  const ACTION_SOUNDS = { buyPack: 'bucks', buyBag: 'bucks', openItem: 'rarePull', selectChar: 'crowd' };
  const QUIET = ['play', 'endTurn', 'soundSettings', 'toggleMute', 'noop'];
  function actionSound(name, before) {
    const A = F.Audio;
    if (QUIET.includes(name)) return;
    // The pack opening show plays its own sounds (screens.js)
    if (name === 'ripPack' || name === 'revealAll') return;
    if (name === 'pickDeck' && UI.screen === 'shop') return A.sfx('bucks');
    // Big moments that happen after a button
    if (UI.screen !== before) {
      if (UI.screen === 'reward') return A.sfx('bucks');
      if (UI.screen === 'monthEnd') return A.sfx('crowd');
      if (UI.screen === 'gameover' && UI.ctx.reason === 'champion') { A.sfx('win'); A.sfx('crowd', 0.3); return; }
    }
    A.sfx(ACTION_SOUNDS[name] || 'click');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(FCD);
