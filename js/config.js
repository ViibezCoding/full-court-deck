// ============================================================
// FULL COURT DECK - BALANCE SETTINGS
// Change the numbers in this file to tune the game.
// Save the file, then refresh the browser to see the change.
// ============================================================
window.FCD = window.FCD || {};

FCD.CONFIG = {
  // ---- Turn basics ----
  STARTING_ENERGY: 3,       // Energy you get each possession
  HAND_SIZE: 5,             // Cards drawn each possession
  MAX_HAND: 10,             // Hand can't hold more than this
  MOMENTUM_CARRYOVER: 0.5,  // Share of unused Momentum kept at end of turn (0.5 = half, rounded down)
  HEAT_MAX: 3,               // The Chef's Heat can't go above this
  HEAT_SHOTS: 3,             // Scoring cards The Chef must play in a turn to gain +1 Heat (fewer resets Heat to 0)

  // ---- Stat scaling ----
  // Bonus added to a card = floor((stat - starting stat) / STAT_POINTS_PER_BONUS)
  // Every starting stat is +0. Each 2 points gained (Ring upgrades or during the season) = +1.
  STAT_POINTS_PER_BONUS: 2,
  STAT_MAX: 12,

  // ---- Stamina (your health for the whole run) ----
  STAMINA_BASE: 30,                 // Max Stamina = 30 + (Stamina stat x 5)
  STAMINA_PER_STAT_POINT: 5,
  LOSS_STAMINA_PER_POINT: 1.0,      // Stamina lost per point you lose a game by
  LOCKER_HEAL_PCT: 0.30,            // Locker Room rest heals 30% of max
  UPGRADE_PICKS: 2,                 // Practice Facility / Locker Room film session: cards upgraded (different cards)
  BIG_UPGRADE_TIER: 4,              // Upgrading to /25 (tier 4) or higher uses both upgrade points
  MARQUEE_STAT_GAIN: 1,             // Stat increase you pick after beating a Marquee Game
  PLAYOFF_STAT_GAIN: 1,             // ...and after winning a Playoff game
  ACT_END_HEAL_PCT: 0.20,           // Heal 20% at the end of each month
  // Stamina doesn't count in the Playoffs or Finals (losses cost none, it can't run out)

  // ---- Games ----
  // Score needed to win a game, one number per month (Nov ... Jun)
  TARGET_SCORE: [50, 55, 65, 75, 85, 95, 110, 110],
  RIVALRY_TARGET_BONUS: 5,          // Rivalry games go a little longer
  MARQUEE_TARGET_BONUS: 10,         // Marquee, Playoff and Finals games go longer (Playoffs and Finals = 120)
  // How much stronger opponents are each month (Nov ... Jun), separate from the target score.
  OPP_SCALE: [0.95, 1.1, 1.4, 1.8, 2.0, 2.15, 2.25, 2.35],
  // OPP_POWER multiplies every opponent's points, Defense and bonuses.
  // Raise it to make the game harder, lower it to make it easier.
  OPP_POWER: 2.75,
  // Marquee Games (end-of-month bosses) are this much stronger on top of that, one number per month (Nov ... Apr).
  // 1.10 = 10% stronger. December's is 10% easier than the rest (1.10 x 0.9 = 0.99).
  MARQUEE_OPP_MULT: [1.10, 0.99, 1.10, 1.10, 1.10, 1.10],
  OPP_SCORE_MULT: 1.10,             // Opponents' points (and their "+X to their plays" buffs) are 10% stronger on top of that
  OPP_DEFENSE_MULT: 1.10,           // Opponents' Defense plays are 10% stronger on top of that

  // ---- Bucks ----
  STARTING_BUCKS: 50,
  // Bucks for a win = (win bonus + margin bonus) x game multiplier
  // Win bonus = 15, plus 5 for every 2 months into the season
  //   Nov-Dec 15 · Jan-Feb 20 · Mar-Apr 25 · May 30
  BUCKS_WIN_BASE: 15,
  BUCKS_WIN_STEP: 5,
  BUCKS_WIN_STEP_MONTHS: 2,
  // Margin bonus = 1 Buck per 2 points you win by (rounded down), capped at 25
  BUCKS_MARGIN_POINTS_PER_BUCK: 2,
  BUCKS_MARGIN_CAP: 25,
  RIVALRY_BUCKS_MULT: 1.5,          // Rivalry Games
  MARQUEE_BUCKS_MULT: 2,            // Marquee Games and Playoff games (Finals games pay no Bucks)

  // ---- Rings (permanent currency) ----
  RINGS_MAKE_PLAYOFFS: 1,           // Earned for finishing April (making the playoffs)
  RINGS_CHAMPIONSHIP: 3,            // Earned for winning the Finals

  // ---- Shop ----
  PACK_CARDS: 3,                    // Cards to pick from in each pack
  MYSTERY_BAG_PRICE: 150,           // Shop item: a random piece of memorabilia
  SPONSOR_BUCKS_CHANCE: 0.33,       // Sponsor Gift: chance of Bucks instead of memorabilia
  SPONSOR_BUCKS: 50,

  // ---- Map ----
  // Stops before the Marquee Game, one number per regular-season month (Nov ... Apr).
  // Total stops in a month = this number + 1 (the Marquee Game).
  MAP_ROWS: [6, 7, 8, 8, 8, 9],
  MAP_LANES: 4,
  // Pathways per month: a random number between these two (each starts in its own lane)
  MAP_PATHS: [3, 4],
  // How often each node type shows up (higher = more common)
  NODE_WEIGHTS: { game: 46, event: 18, rivalry: 11, shop: 10, practice: 10, treasure: 5 },
};

// Serial number tiers, from most common to rarest.
// valueBonus: added to the card's main number.
// costCut: 'big' = cards costing 2+ cost 1 less.  'all' = every card costing 1+ costs 1 less.
// Sell prices are in FCD.SELL_PRICES below.
FCD.TIERS = [
  { key: 'base', label: 'Base', print: null, valueBonus: 0, costCut: null },
  { key: '500',  label: '/500', print: 500,  valueBonus: 1, costCut: null },
  { key: '250',  label: '/250', print: 250,  valueBonus: 2, costCut: null },
  { key: '99',   label: '/99',  print: 99,   valueBonus: 3, costCut: null },
  { key: '25',   label: '/25',  print: 25,   valueBonus: 4, costCut: 'big' },
  { key: '10',   label: '/10',  print: 10,   valueBonus: 5, costCut: 'big' },
  { key: '1',    label: '1/1',  print: 1,    valueBonus: 7, costCut: 'all' },
];

// Bucks for selling a card in the Card Shop, by card type, one number per tier:
//   Base, /500, /250, /99, /25, /10, 1/1   (Showtime cards only exist from /99 up)
FCD.SELL_PRICES = {
  base:      [5, 10, 15, 25, 50, 100, 250],          // Base set (packs) and starting-deck cards
  auto:      [20, 40, 60, 80, 125, 250, 500],        // Autographs
  showtime:  [null, null, null, 100, 250, 500, 1000], // Showtime comic insert
};

FCD.MONTHS = ['November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];

FCD.STATS = [
  { key: 'SHO', label: 'Shooting' }, // 3-pointers and mid-range jumpers
  { key: 'FIN', label: 'Finishing' },
  { key: 'PAS', label: 'Passing' },
  { key: 'HDL', label: 'Ball Handling' },
  { key: 'STL', label: 'Stealing' },
  { key: 'BLK', label: 'Blocking' },
  { key: 'REB', label: 'Rebounding' },
  { key: 'STA', label: 'Stamina' },
];

// Practice Facility "Train a stat": pick a group, one random stat in it gets +1.
// Stamina is not in a group (it is health, not a card stat).
FCD.TRAIN_GROUPS = {
  Scoring: ['SHO', 'FIN'],
  Defense: ['STL', 'BLK', 'REB'],
  Playmaking: ['PAS', 'HDL'],
};
