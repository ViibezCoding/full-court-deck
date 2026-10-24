// ============================================================
// CARD PACKS
// odds: chance of each serial tier, in this order:
//        [Base, /500, /250, /99, /25, /10, 1/1]
// guaranteed: odds for the FIRST card only (Legends Pack)
// showtime: chance the pack contains a Showtime insert
// hit: chance of a bonus Autograph card (one roll per pack)
// autoOdds: serial tier odds for that Autograph, same order as odds
// (Memorabilia never comes from packs. Buy a Mystery Bag in the shop instead.)
// ============================================================
(function (F) {
  F.PACKS = {
    base:      { name: 'Base Pack',      price: 50,  odds: [80, 12, 4, 3, 0.57, 0.09, 0.01],     showtime: 0.0033, hit: 0.10, autoOdds: [0, 0, 75, 20, 3.75, 1, 0.25], pool: 'base' },
    team:      { name: 'Team Pack',      price: 75,  odds: [75, 12.7, 6, 4, 1, 0.275, 0.025], showtime: 0.01,   hit: 0.15, autoOdds: [0, 0, 70, 23, 5.75, 1, 0.25], pool: 'base', themed: true },
    legends:   { name: 'Legends Pack',   price: 200, odds: [60, 15, 8, 4.5, 2, 0.4, 0.1],      guaranteed: [0, 0, 0, 97, 2.3, 0.59, 0.11], showtime: 0.10, hit: 0.30, autoOdds: [0, 0, 50, 30, 16, 3, 1], pool: 'base' },
    mystery:   { name: 'Mystery Pack',   priceRange: [30, 100], odds: [68, 12, 10, 4, 1.6, 0.35, 0.05], showtime: 0.04, hit: 0.20, autoOdds: [0, 0, 65, 25, 8, 1.5, 0.5], pool: 'base' },
  };

  // Showtime cards only come as /99, /25, /10 or 1/1
  F.SHOWTIME_ODDS = [0, 0, 0, 60, 25, 12, 3];

  // Team Pack themes
  F.THEMES = { shooting: 'Shooting', inside: 'Inside Game', defense: 'Defense', playmaking: 'Playmaking' };

  // How often each rarity shows up inside a pack
  F.RARITY_WEIGHTS = { common: 6, uncommon: 3, rare: 1 };
})(FCD);
