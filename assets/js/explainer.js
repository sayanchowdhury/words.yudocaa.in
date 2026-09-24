// Explainer and tutorial enhancements for PaperMod. Each feature only runs when
// its markup is on the page, and every one degrades to readable static HTML.

const CDN = {
  mermaid: "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs",
  asciinemaJs: "https://cdn.jsdelivr.net/npm/asciinema-player@3/dist/bundle/asciinema-player.min.js",
  asciinemaCss: "https://cdn.jsdelivr.net/npm/asciinema-player@3/dist/bundle/asciinema-player.css",
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const wideScreen = window.matchMedia("(min-width: 1280px)");

const store = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  },
};

const isDark = () => document.documentElement.dataset.theme === "dark" ||
  (document.body && document.body.classList.contains("dark"));

// Run `fn` once, when `el` first comes near the viewport.
function whenVisible(el, fn) {
  if (!("IntersectionObserver" in window)) return fn();
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      io.disconnect();
      fn();
    }
  }, { rootMargin: "400px 0px" });
  io.observe(el);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.append(s);
  });
}

function loadStyle(href) {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.append(l);
}

// Re-run `fn` whenever PaperMod's theme toggle flips light/dark.
function onThemeChange(fn) {
  const mo = new MutationObserver(fn);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

/* Reading progress --------------------------------------------------------- */

function readingProgress() {
  const bar = document.querySelector(".reading-progress span");
  const article = document.querySelector(".post-content");
  if (!bar || !article) return;
  let queued = false;
  const update = () => {
    queued = false;
    const rect = article.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const done = total <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / total));
    bar.style.transform = `scaleX(${done})`;
  };
  window.addEventListener("scroll", () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* Table of contents: side rail on wide screens, with scroll-spy ------------ */

function tableOfContents() {
  const toc = document.querySelector(".post-single details.toc");
  if (!toc) return;
  const links = [...toc.querySelectorAll('a[href^="#"]')];
  const targets = links
    .map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))))
    .filter(Boolean);
  if (!targets.length) return;

  const place = () => {
    toc.classList.toggle("toc--rail", wideScreen.matches);
    if (wideScreen.matches) toc.open = true;
  };
  place();
  wideScreen.addEventListener("change", place);

  let current = null;
  const setActive = (id) => {
    if (id === current) return;
    current = id;
    for (const a of links) {
      const on = decodeURIComponent(a.hash.slice(1)) === id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    }
  };

  // The active heading is the last one whose top has passed 30% of the viewport.
  let queued = false;
  const spy = () => {
    queued = false;
    const line = window.innerHeight * 0.3;
    let active = targets[0];
    for (const t of targets) {
      if (t.getBoundingClientRect().top <= line) active = t;
      else break;
    }
    setActive(active.id);
  };
  window.addEventListener("scroll", () => {
    if (!queued) { queued = true; requestAnimationFrame(spy); }
  }, { passive: true });
  spy();
}

/* Tabs ---------------------------------------------------------------------- */

function tabs() {
  const groups = document.querySelectorAll(".tabs");
  if (!groups.length) return;

  const select = (root, label, { focus = false } = {}) => {
    const buttons = [...root.querySelectorAll('[role="tab"]')];
    const target = buttons.find((b) => b.dataset.label === label);
    if (!target) return false;
    for (const b of buttons) {
      const on = b === target;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
    }
    if (focus) target.focus();
    return true;
  };

  const syncGroup = (group, label, origin) => {
    store.set(`tabs:${group}`, label);
    for (const other of document.querySelectorAll(`.tabs[data-group="${CSS.escape(group)}"]`)) {
      if (other === origin) continue;
      // Keep the clicked tab list anchored while other groups change height.
      const before = origin.getBoundingClientRect().top;
      select(other, label);
      window.scrollBy(0, origin.getBoundingClientRect().top - before);
    }
  };

  for (const root of groups) {
    const list = root.querySelector('[role="tablist"]');
    const buttons = [...list.querySelectorAll('[role="tab"]')];
    list.hidden = false;
    root.classList.add("is-ready");

    const group = root.dataset.group;
    const saved = group && store.get(`tabs:${group}`);
    if (!(saved && select(root, saved))) select(root, buttons[0].dataset.label);

    list.addEventListener("click", (e) => {
      const b = e.target.closest('[role="tab"]');
      if (!b) return;
      select(root, b.dataset.label);
      if (group) syncGroup(group, b.dataset.label, root);
    });

    list.addEventListener("keydown", (e) => {
      const i = buttons.indexOf(document.activeElement);
      if (i < 0) return;
      const next = {
        ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: buttons.length - 1,
      }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      const b = buttons[(next + buttons.length) % buttons.length];
      select(root, b.dataset.label, { focus: true });
      if (group) syncGroup(group, b.dataset.label, root);
    });
  }
}

/* Mermaid diagrams ---------------------------------------------------------- */

function diagrams() {
  const blocks = [...document.querySelectorAll("pre.mermaid")];
  if (!blocks.length) return;
  for (const b of blocks) b.dataset.source = b.textContent;

  let mermaid;
  const render = async () => {
    mermaid ??= (await import(CDN.mermaid)).default;
    const css = getComputedStyle(document.documentElement);
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark() ? "dark" : "neutral",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      securityLevel: "strict",
      themeVariables: { edgeLabelBackground: css.getPropertyValue("--theme").trim() },
    });
    for (const b of blocks) {
      b.removeAttribute("data-processed");
      b.textContent = b.dataset.source;
    }
    try {
      await mermaid.run({ nodes: blocks });
      for (const b of blocks) b.classList.add("is-rendered");
    } catch (err) {
      console.error("[explainer] mermaid:", err);
    }
  };
  whenVisible(blocks[0], render);
  onThemeChange(() => { if (mermaid) render(); });
}

/* Terminal recordings ------------------------------------------------------- */

function terminalCasts() {
  const players = document.querySelectorAll(".terminal-cast__player[data-cast]");
  let loading;
  for (const el of players) {
    whenVisible(el, async () => {
      loading ??= (loadStyle(CDN.asciinemaCss), loadScript(CDN.asciinemaJs));
      try {
        await loading;
        el.replaceChildren();
        window.AsciinemaPlayer.create(el.dataset.cast, el, {
          cols: Number(el.dataset.cols),
          rows: Number(el.dataset.rows),
          startAt: Number(el.dataset.start) || 0,
          idleTimeLimit: el.dataset.idle ? Number(el.dataset.idle) : 2,
          fit: "width",
          terminalFontFamily: "var(--code-font, ui-monospace, monospace)",
        });
      } catch (err) {
        console.error("[explainer] asciinema:", err);
      }
    });
  }
}

/* Live widgets -------------------------------------------------------------- */

function widgets() {
  for (const fig of document.querySelectorAll(".widget[data-widget]")) {
    const root = fig.querySelector(".widget__root");
    whenVisible(fig, async () => {
      try {
        const mod = await import(new URL(fig.dataset.widget, document.baseURI).href);
        const fallback = root.innerHTML;
        root.replaceChildren();
        try {
          await mod.default(root, { reducedMotion: reducedMotion.matches });
          fig.classList.add("is-live");
        } catch (err) {
          root.innerHTML = fallback;
          throw err;
        }
      } catch (err) {
        console.error(`[explainer] widget ${fig.dataset.widget}:`, err);
      }
    });
  }
}

/* Filter chips (the writings page) ------------------------------------------ */

function filters() {
  for (const bar of document.querySelectorAll(".filters[data-filter-target]")) {
    const scope = document.querySelector(bar.dataset.filterTarget);
    if (!scope) continue;
    const state = {};
    const apply = () => {
      let shown = 0;
      for (const li of scope.querySelectorAll("li[data-kind]")) {
        const ok = (!state.kind || li.dataset.kind === state.kind) &&
          (!state.topic || li.dataset.topic.split(" ").includes(state.topic));
        li.hidden = !ok;
        if (ok) shown += 1;
      }
      for (const group of scope.querySelectorAll(".year-group")) {
        group.hidden = !group.querySelector("li[data-kind]:not([hidden])");
      }
      scope.querySelector(".filters__empty").hidden = shown > 0;
    };
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-value]");
      if (!b) return;
      const group = b.closest("[data-filter]");
      for (const other of group.querySelectorAll("button")) other.setAttribute("aria-pressed", String(other === b));
      state[group.dataset.filter] = b.dataset.value;
      apply();
    });
    bar.hidden = false;
  }
}

/* Bookshelf: pick a spine to pull its card out -------------------------------- */

function bookshelf() {
  const shelf = document.querySelector(".bookshelf");
  if (!shelf) return;
  const cards = [...shelf.querySelectorAll(".book-card")];
  const spines = [...shelf.querySelectorAll(".spine")];
  shelf.classList.add("is-live");

  const open = (id, { scroll = false } = {}) => {
    const card = cards.find((c) => c.id === id) || cards[0];
    if (!card) return;
    for (const c of cards) c.hidden = c !== card;
    for (const s of spines) {
      const on = s.dataset.book === card.id;
      s.classList.toggle("is-out", on);
      if (on) s.setAttribute("aria-current", "true");
      else s.removeAttribute("aria-current");
    }
    if (scroll) card.scrollIntoView({ block: "nearest", behavior: reducedMotion.matches ? "auto" : "smooth" });
  };

  for (const s of spines) {
    s.addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState(null, "", `#${s.dataset.book}`);
      open(s.dataset.book, { scroll: true });
    });
  }
  open(decodeURIComponent(location.hash.slice(1)));
}

/* MoonBoard wall (homepage) --------------------------------------------------- */

const COLS = "ABCDEFGHIJK";
const ROWS = 18;
const CELL = 40;
const PAD = { l: 28, r: 14, t: 26, b: 26 };
const GRADES = [
  ["5+", "V1"], ["6A", "V2"], ["6A+", "V3"], ["6B", "V4"], ["6B+", "V4"], ["6C", "V5"],
  ["6C+", "V5"], ["7A", "V6"], ["7A+", "V7"], ["7B", "V8"], ["7B+", "V8"], ["7C", "V9"],
];

// Small deterministic PRNG so the wall is identical on every visit.
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Hold shapes, drawn around (0, 0) at roughly 30px across.
const SHAPES = {
  jug: '<path d="M-14 5C-15-7-7-13 0-13S15-7 14 5C9 9-9 9-14 5Z"/><path class="lip" d="M-8 2C-6-3 6-3 8 2"/>',
  crimp: '<path d="M-13 -2C-13 -6 13 -6 13 -2L12 3C4 6-4 6-12 3Z"/>',
  sloper: '<ellipse rx="16" ry="12"/><ellipse class="shine" cx="-4" cy="-4" rx="7" ry="4"/>',
  pinch: '<path d="M0-15C6-15 7-5 6 3S4 15 0 15-6 11-6 3-6-15 0-15Z"/>',
  chip: '<circle r="6"/>',
};
const SHAPE_KEYS = ["jug", "jug", "crimp", "crimp", "sloper", "pinch", "chip"];
const SETS = ["set-a", "set-b", "set-c", "set-d"];

const cellXY = (col, row) => ({
  x: PAD.l + col * CELL + CELL / 2,
  y: PAD.t + (ROWS - row) * CELL + CELL / 2,
});
const coord = (col, row) => `${COLS[col]}${row}`;

function buildWall(problems) {
  const rand = seeded(20090);
  const holds = new Map();
  const place = (col, row, r = rand) => {
    const key = `${col}:${row}`;
    if (!holds.has(key)) {
      holds.set(key, {
        col, row,
        shape: SHAPE_KEYS[Math.floor(r() * SHAPE_KEYS.length)],
        set: SETS[Math.floor(r() * SETS.length)],
        rot: Math.round(r() * 360),
        scale: 1 + r() * 0.4,
      });
    }
    return holds.get(key);
  };
  for (let row = 1; row <= ROWS; row++) {
    for (let col = 0; col < COLS.length; col++) {
      if (rand() < (row < 5 ? 0.3 : 0.4)) place(col, row);
    }
  }

  // A route per problem: start low, one move per item, finish on row 18.
  const routes = problems.map((p) => {
    const r = seeded(hashString(p.name));
    const moves = p.items.length;
    let col = 2 + Math.floor(r() * 7);
    const startRow = 2 + Math.floor(r() * 3);
    const start = [place(col, startRow, r)];
    if (r() < 0.6) start.push(place(Math.min(10, col + 1 + Math.floor(r() * 2)), startRow, r));
    const top = 17;
    const step = (top - startRow) / (moves + 1);
    const hands = p.items.map((item, i) => {
      col = Math.max(0, Math.min(10, col + Math.round((r() - 0.5) * 6)));
      const row = Math.round(startRow + step * (i + 1));
      return { hold: place(col, row, r), item };
    });
    col = Math.max(0, Math.min(10, col + Math.round((r() - 0.5) * 4)));
    const finish = place(col, ROWS, r);
    const n = Math.min(GRADES.length - 1, Math.round(Math.log2(p.count + 1) * 1.6));
    return { problem: p, start, hands, finish, grade: GRADES[n] };
  });
  return { holds: [...holds.values()], routes };
}

function renderWall({ holds }) {
  const w = PAD.l + COLS.length * CELL + PAD.r;
  const h = PAD.t + ROWS * CELL + PAD.b;
  const rand = seeded(7);
  let grain = "";
  for (let i = 0; i < 26; i++) {
    const y = rand() * h;
    grain += `<path d="M0 ${y.toFixed(1)}C${w * 0.3} ${(y + (rand() - 0.5) * 30).toFixed(1)} ${w * 0.7} ${(y + (rand() - 0.5) * 30).toFixed(1)} ${w} ${(y + (rand() - 0.5) * 12).toFixed(1)}"/>`;
  }
  let nuts = "";
  for (let row = 1; row <= ROWS; row++) {
    for (let col = 0; col < COLS.length; col++) {
      const { x, y } = cellXY(col, row);
      nuts += `<circle cx="${x}" cy="${y}" r="2.2"/>`;
    }
  }
  const labels = [...COLS].map((c, col) => {
    const { x } = cellXY(col, 1);
    return `<text x="${x}" y="${PAD.t - 9}">${c}</text><text x="${x}" y="${h - 8}">${c}</text>`;
  }).join("") + Array.from({ length: ROWS }, (_, i) => {
    const { y } = cellXY(0, i + 1);
    return `<text x="${PAD.l / 2}" y="${y + 4}">${i + 1}</text>`;
  }).join("");
  const holdSvg = holds.map((hd) => {
    const { x, y } = cellXY(hd.col, hd.row);
    return `<g class="hold ${hd.set}" data-cell="${hd.col}:${hd.row}" transform="translate(${x} ${y}) rotate(${hd.rot}) scale(${hd.scale.toFixed(2)})">${SHAPES[hd.shape]}<circle class="bolt" r="1.8"/></g>`;
  }).join("");

  return `<svg class="moon__svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="A climbing training board, 11 columns by 18 rows">
    <defs>
      <linearGradient id="moon-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="var(--board-1)"/><stop offset="1" stop-color="var(--board-2)"/>
      </linearGradient>
      <filter id="moon-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="1.5" dy="2.5" stdDeviation="1.6" flood-color="#000" flood-opacity="0.35"/>
      </filter>
      <filter id="moon-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="4"/>
      </filter>
    </defs>
    <rect class="board" width="${w}" height="${h}" rx="6" fill="url(#moon-wood)"/>
    <g class="grain">${grain}</g>
    <g class="nuts">${nuts}</g>
    <g class="labels" aria-hidden="true">${labels}</g>
    <g class="holds" filter="url(#moon-shadow)" aria-hidden="true">${holdSvg}</g>
    <g class="leds"></g>
  </svg>`;
}

function moonboard() {
  const root = document.querySelector(".moonwall");
  const mount = root && root.querySelector("[data-moonboard]");
  const json = root && root.querySelector("[data-moonboard-problems]");
  if (!mount || !json) return;
  let problems;
  try { problems = JSON.parse(json.textContent); } catch { return; }

  const wall = buildWall(problems);
  mount.innerHTML = renderWall(wall);
  mount.hidden = false;
  const leds = mount.querySelector(".leds");
  const caption = root.querySelector(".moon__caption");
  caption.hidden = false;
  const rows = [...root.querySelectorAll("[data-problem]")];

  wall.routes.forEach((route, i) => {
    const grade = rows[i] && rows[i].querySelector("[data-grade]");
    if (grade) grade.textContent = `${route.grade[0]} / ${route.grade[1]}`;
  });

  const ring = (hold, kind, delay, link) => {
    const { x, y } = cellXY(hold.col, hold.row);
    const r = 17 * Math.max(1, hold.scale);
    const inner = `<circle class="led-glow" cx="${x}" cy="${y}" r="${r}"/><circle class="led-ring" cx="${x}" cy="${y}" r="${r}"/>`;
    const style = `style="--delay:${delay}ms"`;
    if (!link) return `<g class="led led--${kind}" ${style} aria-hidden="true">${inner}</g>`;
    return `<a class="led led--${kind}" ${style} href="${esc(link.href)}" aria-label="${esc(link.label)}" data-caption="${esc(link.caption)}">${inner}<circle class="led-hit" cx="${x}" cy="${y}" r="${r + 4}"/></a>`;
  };

  let current = -1;
  const summary = (route) => {
    const s = route.start[0];
    return `${route.problem.name} · ${route.grade[0]} · start ${coord(s.col, s.row)}, top out ${coord(route.finish.col, route.finish.row)}`;
  };

  const select = (i) => {
    if (i === current) return;
    current = i;
    const route = wall.routes[i];
    const step = reducedMotion.matches ? 0 : 70;
    let t = 0;
    let out = route.start.map((h) => ring(h, "start", (t += step))).join("");
    out += route.hands.map(({ hold, item }) => ring(hold, "hand", (t += step), {
      href: item.href,
      label: `${coord(hold.col, hold.row)}: ${item.kind}, ${item.title}`,
      caption: `${coord(hold.col, hold.row)} · ${item.kind} · ${item.title}`,
    })).join("");
    out += ring(route.finish, "finish", (t += step), {
      href: route.problem.href,
      label: `Top out: all of ${route.problem.name}`,
      caption: `${coord(route.finish.col, route.finish.row)} · Top out · all of ${route.problem.name}`,
    });
    leds.innerHTML = out;
    requestAnimationFrame(() => leds.querySelectorAll(".led").forEach((l) => l.classList.add("is-on")));
    caption.textContent = summary(route);
    rows.forEach((row, j) => row.classList.toggle("is-selected", j === i));
  };

  for (const row of rows) {
    const i = Number(row.dataset.problem);
    row.addEventListener("mouseenter", () => select(i));
    row.addEventListener("focus", () => select(i));
  }
  const showCaption = (e) => {
    const a = e.target.closest && e.target.closest("a.led");
    if (a) caption.textContent = a.dataset.caption;
  };
  leds.addEventListener("mouseover", showCaption);
  leds.addEventListener("focusin", showCaption);
  leds.addEventListener("mouseleave", () => { if (current >= 0) caption.textContent = summary(wall.routes[current]); });
  select(0);
}

function init() {
  readingProgress();
  tableOfContents();
  tabs();
  diagrams();
  terminalCasts();
  widgets();
  filters();
  bookshelf();
  moonboard();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
