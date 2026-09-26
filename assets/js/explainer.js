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
    if (!scope || !bar.querySelector("[data-filter]")) continue;
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

/* MoonBoard wall of learning paths --------------------------------------------------- */

const COLS = "ABCDEFGHIJK";
const ROWS = 18;
const CELL = 40;
const PAD = { l: 28, r: 14, t: 26, b: 26 };
// Font grade -> V grade, for showing both like the MoonBoard app.
const V_GRADE = {
  "5": "V1", "5+": "V2", "6A": "V3", "6A+": "V3", "6B": "V4", "6B+": "V4", "6C": "V5",
  "6C+": "V5", "7A": "V6", "7A+": "V7", "7B": "V8", "7B+": "V8", "7C": "V9", "7C+": "V10",
};

// Pages this visitor has opened, so paths can tick the steps already read.
const READ_KEY = "iw:read";
const readPages = () => {
  try { return new Set(JSON.parse(store.get(READ_KEY) || "[]")); } catch { return new Set(); }
};
function recordVisit() {
  try {
    const seen = [...readPages()].filter((p) => p !== location.pathname);
    seen.unshift(location.pathname);
    store.set(READ_KEY, JSON.stringify(seen.slice(0, 500)));
  } catch { /* storage unavailable or corrupt */ }
}

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
// On a route, a hold's shape says what kind of step it is.
const KIND_SHAPE = { Post: "jug", Tutorial: "jug", Note: "crimp", Talk: "sloper", Book: "pinch" };
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

  // A route per problem: start low, one move per step, finish on row 18.
  const claim = (hold, kind) => {
    if (!hold.claimed) {
      hold.claimed = true;
      hold.shape = KIND_SHAPE[kind] || (kind ? "chip" : hold.shape);
    }
    return hold;
  };
  const routes = problems.map((p) => {
    const r = seeded(hashString(p.name));
    const moves = p.items.length;
    let col = 2 + Math.floor(r() * 7);
    const startRow = 2 + Math.floor(r() * 2);
    const start = [claim(place(col, startRow, r))];
    if (r() < 0.6) start.push(claim(place(Math.min(10, col + 2), startRow, r)));
    const step = (17 - startRow) / (moves + 1);
    const hands = p.items.map((item, i) => {
      col = Math.max(0, Math.min(10, col + Math.round((r() - 0.5) * 6)));
      const row = Math.round(startRow + step * (i + 1));
      return { hold: claim(place(col, row, r), item.kind), item };
    });
    col = Math.max(0, Math.min(10, col + Math.round((r() - 0.5) * 4)));
    const finish = claim(place(col, ROWS, r), p.top && p.top.kind);
    return { problem: p, start, hands, finish };
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
  const read = readPages();

  for (const row of rows) {
    const grade = row.querySelector(".moon__grade");
    if (grade && V_GRADE[grade.textContent]) grade.textContent += ` / ${V_GRADE[grade.textContent]}`;
  }

  const tick = '<path class="led-tick" d="M-5 0l3.5 3.5L5-4"/>';
  const ring = (hold, kind, delay, step) => {
    const { x, y } = cellXY(hold.col, hold.row);
    const r = 17 * Math.max(1, hold.scale);
    const done = step && step.href && read.has(new URL(step.href, location.href).pathname);
    const todo = step && step.todo;
    const cls = `led led--${kind}${todo ? " is-todo" : ""}${done ? " is-done" : ""}`;
    const inner = `<circle class="led-glow" cx="${x}" cy="${y}" r="${r}"/><circle class="led-ring" cx="${x}" cy="${y}" r="${r}"/>` +
      (done ? `<g transform="translate(${x + r * 0.72} ${y - r * 0.72})"><circle class="led-badge" r="7"/>${tick}</g>` : "");
    const style = `style="--delay:${delay}ms"`;
    if (!step || !step.href || todo) {
      const label = step ? `data-caption="${esc(step.caption)}"` : "";
      return `<g class="${cls}" ${style} ${label} aria-hidden="true">${inner}</g>`;
    }
    return `<a class="${cls}" ${style} href="${esc(step.href)}" aria-label="${esc(step.label)}" data-caption="${esc(step.caption)}">${inner}<circle class="led-hit" cx="${x}" cy="${y}" r="${r + 4}"/></a>`;
  };

  const describe = (hold, item, prefix = "") => {
    const where = coord(hold.col, hold.row);
    if (item.todo) return { ...item, caption: `${where} · Coming soon · ${item.title}`, label: "" };
    const text = `${prefix}${item.kind ? `${item.kind} · ` : ""}${item.title}`;
    return { ...item, caption: `${where} · ${text}`, label: `${where}: ${text}` };
  };

  let current = -1;
  const summary = (route) => {
    const s = route.start[0];
    const p = route.problem;
    return `${p.name} · ${p.grade} · start ${coord(s.col, s.row)}${p.start ? ` · ${p.start}` : ""}`;
  };

  const select = (i) => {
    if (i === current) return;
    current = i;
    const route = wall.routes[i];
    const stepMs = reducedMotion.matches ? 0 : 70;
    let t = 0;
    let out = route.start.map((h) => ring(h, "start", (t += stepMs))).join("");
    out += route.hands.map(({ hold, item }) => ring(hold, "hand", (t += stepMs), describe(hold, item))).join("");
    const top = route.problem.top && route.problem.top.title
      ? describe(route.finish, route.problem.top, "Top out · ")
      : describe(route.finish, { title: `the whole of ${route.problem.name}`, href: route.problem.href }, "Top out · ");
    out += ring(route.finish, "finish", (t += stepMs), top);
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
    const g = e.target.closest && e.target.closest(".led[data-caption]");
    if (g) caption.textContent = g.dataset.caption;
  };
  leds.addEventListener("mouseover", showCaption);
  leds.addEventListener("focusin", showCaption);
  leds.addEventListener("mouseleave", () => { if (current >= 0) caption.textContent = summary(wall.routes[current]); });
  select(0);
}

/* Path pages: tick the steps this visitor has already opened. -------------- */

function pathTicks() {
  const list = document.querySelector(".route-steps");
  if (!list) return;
  const read = readPages();
  for (const li of list.querySelectorAll("li[data-href]")) {
    if (read.has(new URL(li.dataset.href, location.href).pathname)) li.classList.add("is-done");
  }
}

/* Margin notes: footnotes beside their paragraph on wide screens ------------ */

function marginNotes() {
  const content = document.querySelector(".post-content");
  if (!content) return;
  for (const ref of content.querySelectorAll('a.footnote-ref[href^="#fn"]')) {
    const note = document.getElementById(decodeURIComponent(ref.hash.slice(1)));
    const block = ref.closest("p, li, blockquote");
    if (!note || !block || block.closest(".footnotes")) continue;
    const aside = document.createElement("aside");
    aside.className = "sidenote";
    aside.setAttribute("aria-hidden", "true"); // the real footnote stays for assistive tech
    const body = note.cloneNode(true);
    body.querySelectorAll(".footnote-backref").forEach((a) => a.remove());
    aside.innerHTML = `<span class="sidenote__num">${ref.textContent}</span>${body.innerHTML}`;
    (block.closest("li") ? block.closest("ul, ol") : block).before(aside);
  }
  if (content.querySelector(".sidenote")) content.classList.add("has-sidenotes");
}

/* Bio flip: toss the coin; the bio scrambles and resolves as the other side */

const SIDE_KEY = "iw:side";
const NOISE = { machine: "01<>/{}[]=+*#$%&", human: "abcdefghijklmnopqrstuvwxyz" };
const SCRAMBLE_OUT = 320; // ms: the current bio breaks up
const SCRAMBLE_IN = 720; // ms: the new bio resolves out of the noise
const TOSS = 950; // ms: the coin's flight

function textNodesOf(el) {
  const out = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  while (walk.nextNode()) out.push(walk.currentNode);
  return out;
}

// Each letter or digit gets its own moment to flip; spaces and punctuation
// never change, so words keep their length and lines barely reflow.
function scrambler(el, charset) {
  const nodes = textNodesOf(el).map((node) => {
    const text = node.nodeValue;
    const chars = [...text].map((ch) => ({ ch, live: /[\p{L}\p{N}]/u.test(ch), at: 0 }));
    return { node, text, chars };
  });
  const total = nodes.reduce((n, x) => n + x.chars.length, 0) || 1;
  let k = 0;
  for (const n of nodes) for (const c of n.chars) c.pos = k++ / total;
  const noise = () => charset[Math.floor(Math.random() * charset.length)];
  return {
    // shown(c) decides whether a character shows its real self at this moment.
    render(shown) {
      for (const n of nodes) n.node.nodeValue = n.chars.map((c) => (!c.live || shown(c) ? c.ch : noise())).join("");
    },
    restore() {
      for (const n of nodes) n.node.nodeValue = n.text;
    },
    chars: nodes.flatMap((n) => n.chars),
  };
}

function animateFor(duration, frame) {
  return new Promise((resolve) => {
    const start = performance.now();
    let last = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      if (now - last > 45 || t === 1) { frame(t); last = now; } // ~20 fps of noise reads as flicker, not blur
      if (t < 1) requestAnimationFrame(tick); else resolve();
    };
    requestAnimationFrame(tick);
  });
}

function bioFlip() {
  const root = document.querySelector(".bio-flip");
  const coin = root && root.querySelector(".flip-coin");
  if (!coin) return;
  const inner = coin.querySelector(".flip-coin__inner");
  const faces = {
    human: root.querySelector(".bio-card__face--human"),
    machine: root.querySelector(".bio-card__face--machine"),
  };
  let busy = false;

  const settle = (side, { save = true } = {}) => {
    root.dataset.side = side;
    const other = side === "human" ? "machine" : "human";
    faces[side].inert = false;
    faces[side].removeAttribute("aria-hidden");
    faces[other].inert = true;
    faces[other].setAttribute("aria-hidden", "true");
    coin.setAttribute("aria-pressed", String(side === "machine"));
    coin.setAttribute("aria-label", `Flip to the ${other} side`);
    if (save) store.set(SIDE_KEY, side);
  };

  const toss = (from, to) => {
    if (!inner.animate) return Promise.resolve();
    const a = from === "machine" ? 180 : 0;
    const spin = a + 900; // two and a half turns lands on the other face
    const flight = inner.animate([
      { transform: `translateY(0) rotateX(${a}deg)`, easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" },
      { transform: `translateY(-30px) rotateX(${a + 450}deg)`, offset: 0.45, easing: "cubic-bezier(0.55, 0, 0.8, 0.4)" },
      { transform: `translateY(0) rotateX(${spin}deg)`, offset: 0.88 },
      { transform: `translateY(-3px) rotateX(${spin}deg)`, offset: 0.94 },
      { transform: `translateY(0) rotateX(${spin}deg)` },
    ], { duration: TOSS });
    coin.animate([
      { "--coin-shadow": 1 }, { "--coin-shadow": 0.35, offset: 0.45 }, { "--coin-shadow": 1, offset: 0.88 }, { "--coin-shadow": 1 },
    ], { duration: TOSS });
    return flight.finished.catch(() => {});
  };

  const flip = async () => {
    if (busy) return;
    const from = root.dataset.side;
    const to = from === "human" ? "machine" : "human";
    document.documentElement.dataset.wall = to;
    if (reducedMotion.matches) { settle(to); return; }

    busy = true;
    root.classList.add("is-flipping");
    const tossing = toss(from, to);

    // The current bio breaks up into noise...
    const out = scrambler(faces[from], NOISE[to]);
    for (const c of out.chars) c.at = Math.random();
    await animateFor(SCRAMBLE_OUT, (t) => out.render((c) => c.at > t));

    // ...then the other side resolves out of it, roughly left to right.
    const incoming = scrambler(faces[to], NOISE[to]);
    for (const c of incoming.chars) c.at = c.pos * 0.6 + Math.random() * 0.4;
    incoming.render(() => false);
    out.restore();
    settle(to);
    await animateFor(SCRAMBLE_IN, (t) => incoming.render((c) => c.at <= t));
    incoming.restore();

    await tossing;
    root.classList.remove("is-flipping");
    busy = false;
  };

  const legacy = store.get("tabs:bio") === "C-3PO" ? "machine" : null;
  settle(store.get(SIDE_KEY) || legacy || "human", { save: false });
  root.classList.add("is-ready");
  coin.hidden = false;
  coin.addEventListener("click", flip);

  // First visit: a small hop and wobble so the coin reads as something to toss.
  if (!store.get("iw:flip-hinted") && !reducedMotion.matches && inner.animate) {
    store.set("iw:flip-hinted", "1");
    const a = root.dataset.side === "machine" ? 180 : 0;
    inner.animate(
      [{ transform: `rotateX(${a}deg)` }, { transform: `translateY(-8px) rotateX(${a - 40}deg)` }, { transform: `rotateX(${a + 12}deg)` }, { transform: `rotateX(${a}deg)` }],
      { duration: 1000, delay: 900, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }
}

/* "Copy link" at the end of posts ------------------------------------------ */

function copyLinks() {
  for (const button of document.querySelectorAll("[data-copy]")) {
    const label = button.querySelector("[data-copy-label]");
    const idle = label.textContent;
    let timer;
    button.addEventListener("click", async () => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        ok = true;
      } catch { /* clipboard blocked: fall back to showing the URL */ }
      label.textContent = ok ? "Link copied" : button.dataset.copy;
      button.classList.toggle("is-copied", ok);
      clearTimeout(timer);
      timer = setTimeout(() => { label.textContent = idle; button.classList.remove("is-copied"); }, 2000);
    });
  }
}

function init() {
  readingProgress();
  tableOfContents();
  tabs();
  diagrams();
  terminalCasts();
  widgets();
  filters();
  moonboard();
  pathTicks();
  copyLinks();
  bioFlip();
  marginNotes();
  recordVisit();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
