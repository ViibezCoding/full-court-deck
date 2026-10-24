// ============================================================
// EVENTS (the "?" Trade Deadline nodes on the map)
// apply(run) returns the text shown after the choice.
// It can also return { text, then: 'remove' | 'pack:legends' | ... }
// ============================================================
(function (F) {
  const R = () => F.Run;
  const U = F.U;

  F.EVENTS = [
    {
      id: 'film',
      title: 'Extra Film Session',
      text: 'Coach wants you in the film room late. Your legs are tired, but you see the floor better than ever.',
      choices: [
        { label: 'Watch film', desc: '+1 Passing. Lose 5 Stamina.', apply: run => { R().addStat(run, 'PAS', 1); R().damage(run, 5); return 'You spot every open teammate. Passing +1.'; } },
        { label: 'Go home and rest', desc: 'Nothing happens.', apply: () => 'You get a good night of sleep.' },
      ],
    },
    {
      id: 'cardshow',
      title: 'Local Card Show',
      text: 'A vendor at the card show recognizes you and offers a Legends Pack at a discount.',
      choices: [
        { label: 'Buy it', desc: 'Pay 100 Bucks (normally 200). Open a Legends Pack.', can: run => run.bucks >= 100, apply: run => { run.bucks -= 100; return { text: 'You rip it open right there at the table.', then: 'pack:legends' }; } },
        { label: 'Walk away', desc: 'Keep your Bucks.', apply: () => 'Maybe next time.' },
      ],
    },
    {
      id: 'sneaker',
      title: 'Sneaker Deal',
      text: 'A shoe company wants you at a photo shoot on your off day. The money is good, but you will be worn out.',
      choices: [
        { label: 'Sign the deal', desc: '+60 Bucks. Add a Tired Legs card to your deck.', apply: run => { run.bucks += 60; run.deck.push(R().makeCard(run, 'tired_legs', 0)); return 'Cha-ching. Your legs feel heavy, though.'; } },
        { label: 'Decline', desc: 'Stay fresh.', apply: () => 'You focus on basketball.' },
      ],
    },
    {
      id: 'charity',
      title: 'Charity Game',
      text: 'A local charity game needs a big name. A retired legend is there, and they brought a gift.',
      choices: [
        { label: 'Play hard', desc: 'Lose 10 Stamina. Get a random piece of memorabilia.', can: run => R().availableMemorabilia(run).length > 0, apply: run => { R().damage(run, 10); const id = U.pick(R().availableMemorabilia(run)); R().addMemorabilia(run, id); return `The legend hands you a gift: ${F.MEMORABILIA[id].name}.`; } },
        { label: 'Sign autographs instead', desc: '+20 Bucks.', apply: run => { run.bucks += 20; return 'The fans love it. +20 Bucks.'; } },
      ],
    },
    {
      id: 'trade',
      title: 'Trade Rumors',
      text: "The front office is shopping one of your plays around the league. Do you let it go?",
      choices: [
        { label: 'Make the trade', desc: 'Remove a card from your deck.', apply: () => ({ text: 'Choose a card to trade away.', then: 'remove' }) },
        { label: 'Ignore the rumors', desc: 'Nothing happens.', apply: () => 'You keep your head down.' },
      ],
    },
    {
      id: 'fans',
      title: 'Fan Meet and Greet',
      text: 'A crowd of fans is waiting outside the arena.',
      choices: [
        { label: 'Take selfies', desc: 'Recover 12 Stamina.', apply: run => { const h = R().heal(run, 12); return `The energy is contagious. Recovered ${h} Stamina.`; } },
        { label: 'Sell signed cards', desc: '+25 Bucks.', apply: run => { run.bucks += 25; return '+25 Bucks.'; } },
      ],
    },
    {
      id: 'threept',
      title: '3-Point Contest',
      text: 'You are invited to the 3-Point Contest. Win and the confidence carries over. Lose and you tweak your shoulder.',
      choices: [
        { label: 'Enter', desc: '50%: +2 Shooting. 50%: lose 8 Stamina.', apply: run => { if (Math.random() < 0.5) { R().addStat(run, 'SHO', 2); return 'Money ball after money ball. You win! Shooting +2.'; } R().damage(run, 8); return 'Cold from the corners. You lose 8 Stamina.'; } },
        { label: 'Sit this one out', desc: 'Nothing happens.', apply: () => 'You watch from the front row.' },
      ],
    },
    {
      id: 'mentor',
      title: 'Veteran Mentor',
      text: 'A 15-year veteran offers to teach you a trick or two.',
      choices: [
        { label: 'Learn some moves', desc: 'Upgrade 3 random cards one serial tier each.', apply: run => { const up = R().upgradeRandom(run, 3); return up.length ? `Upgraded: ${up.map(c => `${F.CARDS[c.id].name} (now ${F.TIERS[c.tier].label})`).join(', ')}.` : 'Your deck is already maxed out.'; } },
        { label: 'Work out together', desc: '+1 to a random stat.', apply: run => { const open = F.STATS.filter(s => run.stats[s.key] < F.CONFIG.STAT_MAX); if (!open.length) return 'Your stats are already maxed out.'; const st = U.pick(open); R().addStat(run, st.key, 1); return `${st.label} +1.`; } },
      ],
    },
  ];
})(FCD);
