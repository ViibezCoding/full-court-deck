// ============================================================
// CHARACTERS (Rookie Card starting stats)
// ============================================================
(function (F) {
  F.CHARACTERS = {
    king: {
      id: 'king',
      name: 'The King',
      team: 'Hollywood Royals',
      teamShort: 'ROYALS',
      number: 23,
      pos: 'Forward',
      // Rookie Card art. To use your own picture instead, set image: 'images/king.png'
      image: null,
      colors: {
        jersey: '#552583', jerseyLight: '#7440a8', jerseyDark: '#331258', trim: '#FDB927',
        skin: '#6b4329', skinLight: '#8d5b3b', skinDark: '#45281a', hair: '#16100d',
        headband: true, beard: true,
      },
      blurb: 'Does a bit of everything. Strong finisher and passer, solid on defense.',
      mechanic: {
        name: 'Versatility',
        text: 'Play a Scoring, a Defense and a Playmaking card in the same turn to gain +1 Energy next turn.',
      },
      stats: { SHO: 4, FIN: 6, PAS: 5, HDL: 4, STL: 3, BLK: 4, REB: 5, STA: 5 },
    },
    chef: {
      id: 'chef',
      name: 'The Chef',
      team: 'Bay City Bakers',
      teamShort: 'BAKERS',
      number: 30,
      pos: 'Guard',
      // Rookie Card art. To use your own picture instead, set image: 'images/chef.png'
      image: null,
      colors: {
        jersey: '#1D428A', jerseyLight: '#3563b8', jerseyDark: '#112a5c', trim: '#FFC72C',
        skin: '#a7744f', skinLight: '#c79268', skinDark: '#76502f', hair: '#2a1a12',
        headband: false, beard: false,
      },
      blurb: 'Long-range sniper. Lights it up from deep, but struggles on defense.',
      mechanic: {
        name: 'Heat',
        text: 'Each turn you play 3 scoring cards gives +1 Heat. Heat adds to every Shooting card. If you don\'t play 3 scoring cards in a turn, Heat resets to 0. Maximum Heat: +3.',
      },
      stats: { SHO: 6, FIN: 4, PAS: 5, HDL: 6, STL: 5, BLK: 2, REB: 3, STA: 5 },
    },
  };
})(FCD);
