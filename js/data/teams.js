// ============================================================
// OPPONENT TEAMS
// Each team cycles through its list of plays in order.
// Numbers are November-strength. They grow each month automatically.
//
//   kind: score       -> pts
//         defend      -> def (blocks your shots next possession)
//         buff        -> buff (adds to all their future plays)
//         scoreDefend -> pts + def
// Opponents never hit your Stamina directly: everything they do goes through your Defense.
// ============================================================
(function (F) {
  const s = (name, pts) => ({ name, kind: 'score', pts });
  // Physical plays: the extra muscle is added to their points, so your Defense can stop it
  const foul = (name, pts, extra) => s(name, pts + extra);
  const d = (name, def) => ({ name, kind: 'defend', def });
  const b = (name, buff) => ({ name, kind: 'buff', buff });
  const sd = (name, pts, def) => ({ name, kind: 'scoreDefend', pts, def });

  F.TEAMS = {
    normal: [
      { name: 'Rust Belt Rivets', moves: [s('Post-Up', 7), d('Zone Defense', 6), foul('Hard Foul', 3, 4), s('Mid-Range Jumper', 8)] },
      { name: 'Desert Dunes', moves: [s('Corner Three', 6), s('Corner Three', 6), b('Hot Hand', 2), s('Transition Dunk', 8)] },
      { name: 'Bayou Gators', moves: [sd('Grind It Out', 5, 5), foul('Elbows Out', 2, 5), s('Putback', 7)] },
      { name: 'Harbor Hawks', moves: [s('Pick and Pop', 7), d('Switch Everything', 7), s('Lob Pass', 9)] },
      { name: 'Prairie Dogs', moves: [s('Fast Break', 6), s('Fast Break', 6), b('Run and Gun', 1), s('Pull-Up Three', 7)] },
      { name: 'Neon Knights', moves: [d('Trap', 7), s('Iso Bucket', 10), foul('Flagrant', 2, 6)] },
      { name: 'Mountain Goats', moves: [s('Hook Shot', 7), sd('Rim Protection', 4, 7), s('Two-Hand Slam', 9)] },
      { name: 'Capital Crowns', moves: [b("Coach's Challenge", 2), s('Wing Three', 7), s('Drive and Kick', 8), d('Box-and-One', 6)] },
    ],
    rivalry: [
      { name: 'Twin City Titans', moves: [s('Twin Towers', 10), d('The Wall', 10), foul('Bully Ball', 4, 6)] },
      { name: 'Empire Bridges', moves: [b('Crowd Roar', 3), s('Splash', 9), sd('Grit and Grind', 6, 6)] },
      { name: 'Lakeshore Lightning', moves: [s('Lightning Lob', 11), s('Quick Strike', 8), d('Press', 8)] },
    ],
    // One Marquee (boss) team per regular-season month, November to April
    marquee: [
      { name: 'Steel Town Bruisers', moves: [foul('Enforcer', 4, 7), s('Power Post', 10), d('Bully Defense', 10), s('Bang Inside', 12)] },
      { name: 'Snow Valley Yetis', moves: [d('Blizzard Defense', 13), s('Avalanche', 12), sd('Deep Freeze', 7, 8)] },
      { name: 'Sunset Showboats', moves: [b('Showboat', 3), s('Highlight Reel', 11), s('Behind-the-Back Layup', 9)] },
      { name: 'All-Star Selects', moves: [s('All-Star Alley-Oop', 12), b('Fan Vote', 2), s('Skills Challenge', 10), d('Token Defense', 4)] },
      { name: 'Bracket Busters', moves: [s('Buzzer Beater', 13), d('Full Press', 10), foul('Madness', 3, 6)] },
      { name: 'Clinchers', moves: [sd('Playoff Mode', 8, 8), s('Clutch Three', 12), b('Lock In', 2)] },
    ],
    // May: one game per playoff round
    playoffs: [
      { name: 'Bay Bridge Bombers', round: 'First Round', moves: [s('Three-Point Barrage', 10), s('Bomb Squad', 9), b('Heat Check', 2)] },
      { name: 'Midwest Monsters', round: 'Conference Semifinals', moves: [d('Monster Defense', 11), s('Monster Jam', 12), foul('Physical Play', 3, 6)] },
      { name: 'Dynasty Dragons', round: 'Conference Finals', moves: [sd('Dynasty Ball', 8, 8), s('Dragon Fire', 13), b('Championship DNA', 2), d('Clamps', 10)] },
    ],
    // June: best of three
    finals: { name: 'The Superteam', round: 'The Finals', moves: [s('Big Three', 12), d('Switch Everything', 12), b('Superteam Synergy', 3), foul('Veteran Tricks', 4, 6), s('Iso Superstar', 14)] },
  };
})(FCD);
