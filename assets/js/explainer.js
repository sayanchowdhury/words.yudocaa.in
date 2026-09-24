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
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: buttons.length - 1 }[e.key];
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

function init() {
  readingProgress();
  tableOfContents();
  tabs();
  diagrams();
  terminalCasts();
  widgets();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
