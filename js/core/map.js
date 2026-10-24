// Map generation: branching paths like Slay the Spire.
(function (F) {
  const U = F.U;
  const cfg = () => F.CONFIG;
  const Map = {};

  Map.LABELS = {
    game: 'Game',
    rivalry: 'Rivalry Game',
    shop: 'Card Shop',
    practice: 'Practice Facility',
    locker: 'Locker Room',
    event: 'Trade Deadline',
    treasure: 'Sponsor Gift',
    boss: 'Marquee Game',
    playoff: 'Playoff Game',
    finals: 'The Finals',
  };

  Map.generate = act => {
    if (act === 6) return playoffs();
    if (act === 7) return finals();
    return regular(act);
  };

  function regular(act) {
    const rows = cfg().MAP_ROWS;
    const R = Array.isArray(rows) ? rows[Math.min(act, rows.length - 1)] : rows;
    const L = cfg().MAP_LANES;
    const nodes = {};
    const edges = [];
    const key = (r, l) => `n${r}_${l}`;
    const ensureNode = (r, l) => {
      const id = key(r, l);
      if (!nodes[id]) nodes[id] = { id, row: r, lane: l, type: null, done: false };
      return id;
    };
    const hasEdge = (a, b) => edges.some(e => e[0] === a && e[1] === b);
    // Would an edge from lane a (row r) to lane b (row r+1) cross an existing edge?
    const crosses = (r, a, b) =>
      edges.some(([f, t]) => {
        const nf = nodes[f];
        const nt = nodes[t];
        if (nf.row !== r) return false;
        return (nf.lane < a && nt.lane > b) || (nf.lane > a && nt.lane < b);
      });

    const paths = cfg().MAP_PATHS;
    const P = Math.min(L, Array.isArray(paths) ? U.randInt(paths[0], paths[1]) : paths);
    // Each pathway starts in a different lane, so there are always P starting choices
    const starts = U.shuffle([...Array(L).keys()]).slice(0, P);
    for (let p = 0; p < P; p++) {
      let lane = starts[p];
      for (let r = 0; r < R; r++) {
        const id = ensureNode(r, lane);
        if (r === R - 1) break;
        const proposed = U.clamp(lane + U.randInt(-1, 1), 0, L - 1);
        const candidates = [proposed, lane, lane - 1, lane + 1].filter(x => x >= 0 && x < L);
        const next = candidates.find(x => !crosses(r, lane, x));
        const chosen = next == null ? lane : next;
        const nid = ensureNode(r + 1, chosen);
        if (!hasEdge(id, nid)) edges.push([id, nid]);
        lane = chosen;
      }
    }

    const list = Object.values(nodes);
    list.forEach(n => {
      if (n.row === 0) n.type = 'game';
      else if (n.row === R - 1) n.type = 'locker';
      else {
        const w = { ...cfg().NODE_WEIGHTS };
        if (n.row < 2) w.rivalry = 0;
        n.type = U.weighted(Object.keys(w), k => w[k]);
      }
    });

    // Make sure every month has at least one shop and one practice
    ['shop', 'practice'].forEach(t => {
      if (list.some(n => n.type === t)) return;
      const cands = list.filter(n => n.row >= 2 && n.row <= R - 2 && n.type !== 'shop' && n.type !== 'practice');
      if (cands.length) U.pick(cands).type = t;
    });

    const boss = { id: 'boss', row: R, lane: (L - 1) / 2, type: 'boss', done: false, final: true };
    list.filter(n => n.row === R - 1).forEach(n => edges.push([n.id, boss.id]));
    list.push(boss);
    return { nodes: list, edges, rows: R + 1, lanes: L };
  }

  // Stops offered between Playoff and Finals games (no Locker Room in May or June)
  const POSTSEASON_STOPS = ['shop', 'practice'];
  const stopLane = i => 0.5 + i * 2; // two stops: left and right of center

  // May: Round 1 -> stop -> Round 2 -> stop -> Conference Finals
  function playoffs() {
    const nodes = [];
    const edges = [];
    const rest = row => POSTSEASON_STOPS.map((t, i) => {
      const n = { id: `r${row}_${t}`, row, lane: stopLane(i), type: t, done: false };
      nodes.push(n);
      return n;
    });
    const game = (row, round, final) => {
      const n = { id: `p${round}`, row, lane: 1.5, type: 'playoff', round, done: false, final: !!final };
      nodes.push(n);
      return n;
    };
    const g0 = game(0, 0);
    const r1 = rest(1);
    const g1 = game(2, 1);
    const r3 = rest(3);
    const g2 = game(4, 2, true);
    r1.forEach(n => { edges.push([g0.id, n.id]); edges.push([n.id, g1.id]); });
    r3.forEach(n => { edges.push([g1.id, n.id]); edges.push([n.id, g2.id]); });
    return { nodes, edges, rows: 5, lanes: 4 };
  }

  // June: one stop (shop or practice), then the Finals (best of three)
  function finals() {
    const nodes = [];
    const edges = [];
    const fin = { id: 'finals', row: 1, lane: 1.5, type: 'finals', done: false, final: true };
    POSTSEASON_STOPS.forEach((t, i) => {
      const n = { id: `f_${t}`, row: 0, lane: stopLane(i), type: t, done: false };
      nodes.push(n);
      edges.push([n.id, fin.id]);
    });
    nodes.push(fin);
    return { nodes, edges, rows: 2, lanes: 4 };
  }

  Map.node = (run, id) => run.map.nodes.find(n => n.id === id);

  Map.available = run => {
    const m = run.map;
    if (!run.pos) {
      const incoming = new Set(m.edges.map(e => e[1]));
      return m.nodes.filter(n => !incoming.has(n.id) && !n.done);
    }
    return m.edges.filter(e => e[0] === run.pos).map(e => Map.node(run, e[1])).filter(n => !n.done);
  };

  F.Map = Map;
})(FCD);
