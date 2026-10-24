// Small helper functions used everywhere.
(function (F) {
  const U = {};

  U.randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  U.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  U.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  U.shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Pick an item using weights, e.g. U.weighted(['a','b'], x => x === 'a' ? 3 : 1)
  U.weighted = (items, weightFn) => {
    const total = items.reduce((s, x) => s + weightFn(x), 0);
    let r = Math.random() * total;
    for (const x of items) {
      r -= weightFn(x);
      if (r < 0) return x;
    }
    return items[items.length - 1];
  };

  // Pick an index from a list of weights, e.g. [70, 20, 10]
  U.weightedIndex = weights => {
    const idx = weights.map((_, i) => i);
    return U.weighted(idx, i => weights[i]);
  };

  U.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  F.U = U;
})(FCD);
