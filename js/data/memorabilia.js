// ============================================================
// MEMORABILIA (relics): items from historic players
// Each item gives a passive bonus for the rest of the season.
// The game checks for these by id in js/core/combat.js.
//
//   kind:   the label on the display case (Signed, Game-worn ...)
//   item:   which drawing to use (see js/ui/memorabilia-art.js)
//   colors: [main color, accent color] for the drawing
// ============================================================
(function (F) {
  F.MEMORABILIA = {
    airness:     { name: "His Airness's Signed Sneakers",        kind: 'Signed',      item: 'sneaker',   colors: ['#CE1141', '#111111'], text: 'Your first shot each game scores +3.' },
    captain:     { name: "Sky Hook's Game-Worn Goggles",         kind: 'Game-worn',   item: 'goggles',   colors: ['#FDB927', '#552583'], text: 'Mid-range Shooting cards (not 3-pointers) ignore Defense.' },
    magic:       { name: "Magic Act's Game-Worn Jersey",         kind: 'Game-worn',   item: 'jersey',    colors: ['#552583', '#FDB927'], number: 32, text: 'Your first Playmaking card each turn costs 1 less.' },
    fundamental: { name: "Big Fundamental's Warmup Jacket",      kind: 'Team-issued', item: 'jacket',    colors: ['#1f2326', '#c4ced4'], text: 'Start every game with 8 Defense.' },
    mailman:     { name: "The Mailman's Mailbag",                kind: 'One of a kind', item: 'bag',     colors: ['#0C2340', '#c9a227'], text: 'Draw 1 extra card on your first turn of each game.' },
    dream:       { name: "Dream Shake's Autographed Basketball", kind: 'Autographed', item: 'ball',      colors: ['#d4621f', '#111111'], text: 'Gain 1 Momentum at the start of each turn.' },
    glove:       { name: "The Glove's Signed Wristband",         kind: 'Signed',      item: 'wristband', colors: ['#00653A', '#FFC200'], text: 'Stealing Defense cards give +2 Defense.' },
    worm:        { name: "The Worm's Rainbow Headband",          kind: 'Game-worn',   item: 'headband',  colors: ['#e63946', '#2a9d8f'], text: 'Rebounding cards also give 2 Defense.' },
    answer:      { name: "The Answer's Arm Sleeve",              kind: 'Game-worn',   item: 'sleeve',    colors: ['#ED174C', '#111111'], text: 'Ball Handling cards also give 1 Momentum.' },
    ironman:     { name: "Iron Man's Bench Towel",               kind: 'Game-used',   item: 'towel',     colors: ['#E56020', '#f4f1ea'], text: '+10 max Stamina.', onGain: run => { run.bonusStamina += 10; F.Run.refreshMax(run); } },
    logo:        { name: "The Logo's Signed Ticket Stub",        kind: 'Signed',      item: 'ticket',    colors: ['#1D428A', '#f4ebd6'], text: '+15 Bucks after every win.' },
    bigshot:     { name: "Big Shot's Cut-Down Net",              kind: 'Game-used',   item: 'net',       colors: ['#f4f4f2', '#F26A1B'], text: 'Start a turn trailing on the scoreboard: gain 1 Energy.' },
  };
})(FCD);
