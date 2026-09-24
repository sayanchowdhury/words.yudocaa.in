// Flatcar A/B update walkthrough.
// Usage: {{< widget name="flatcar-ab-update" >}}fallback text{{< /widget >}}
// Contract: export default function mount(root, { reducedMotion }).

const STYLE = `
.abw { display: grid; gap: 20px; }
.abw-disk { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.abw-part {
  display: grid; grid-template-columns: 76px 1fr auto; align-items: center; gap: 4px 16px;
  padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius);
  background: var(--theme); transition: border-color 200ms ease-out;
}
.abw-part.is-booted { border-color: var(--accent); }
.abw-label { font-family: var(--code-font); font-size: 13px; font-weight: 600; color: var(--primary); }
.abw-version { font-weight: 600; color: var(--primary); }
.abw-version small { display: block; font-weight: 400; font-size: 13px; color: var(--secondary); }
.abw-badge {
  justify-self: end; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
  color: var(--secondary); border: 1px solid var(--border);
}
.abw-part.is-booted .abw-badge { color: var(--accent); border-color: var(--accent); }
.abw-attrs {
  grid-column: 2 / -1; display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 0; padding: 0; list-style: none;
  font-family: var(--code-font); font-size: 12px;
}
.abw-attrs li { padding: 2px 8px; border-radius: 4px; background: var(--code-bg); color: var(--content); }
.abw-attrs li.is-changed { background: color-mix(in oklch, var(--accent) 18%, var(--code-bg)); color: var(--primary); }
.abw-bar { grid-column: 2 / -1; height: 4px; border-radius: 2px; background: var(--code-bg); overflow: hidden; }
.abw-bar span { display: block; height: 100%; background: var(--accent); transform-origin: 0 50%; }
.abw-text { margin: 0; min-height: 4.65em; color: var(--content); }
.abw-text strong { color: var(--primary); }
.abw-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.abw-controls button {
  padding: 7px 16px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--theme); color: var(--primary); font: inherit; font-size: 14px; font-weight: 500; cursor: pointer;
}
.abw-controls button:hover:not(:disabled) { border-color: var(--accent); }
.abw-controls button:disabled { opacity: 0.45; cursor: default; }
.abw-controls .abw-next { background: var(--primary); color: var(--theme); border-color: var(--primary); }
.abw-count { margin-inline-start: auto; font-size: 13px; color: var(--secondary); font-variant-numeric: tabular-nums; }
.abw-toggle { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: var(--secondary); cursor: pointer; }
.abw-toggle input { accent-color: var(--accent); width: 16px; height: 16px; }
@media (max-width: 520px) {
  .abw-part { grid-template-columns: 1fr auto; }
  .abw-label { grid-column: 1; }
  .abw-version { grid-column: 1 / -1; grid-row: 2; }
  .abw-attrs, .abw-bar { grid-column: 1 / -1; }
  .abw-count { width: 100%; margin: 0; }
}
@media (prefers-reduced-motion: reduce) { .abw-part { transition: none; } }
`;

// Each step fully describes both partitions, so going back is just re-rendering.
const part = (version, note, priority, tries, successful, extra = {}) =>
  ({ version, note, priority, tries, successful, ...extra });

function steps(failBoot) {
  const common = [
    {
      text: "The machine is running <strong>v1</strong> from <strong>USR-A</strong>. <code>/usr</code> is mounted read-only, so the running OS can't be modified in place. USR-B holds the previous release.",
      booted: "A",
      A: part("v1", "current release", 1, 0, 1),
      B: part("v0", "previous release", 0, 0, 1),
    },
    {
      text: "<strong>update_engine</strong> finds v2 and writes it to <strong>USR-B</strong>, the partition that isn't in use. Nothing about the running system changes. If the download fails halfway, you still have a working v1.",
      booted: "A",
      A: part("v1", "current release", 1, 0, 1),
      B: part("v2", "writing…", 0, 0, 0, { progress: true }),
    },
    {
      text: "Once the image is verified, USR-B is marked to boot next through its GPT attributes: a <strong>higher priority</strong>, <strong>one try</strong>, and <strong>not yet successful</strong>.",
      booted: "A",
      A: part("v1", "current release", 1, 0, 1),
      B: part("v2", "staged for next boot", 2, 1, 0),
    },
    {
      text: "On reboot, GRUB picks the highest-priority partition that is either known good or still has tries left. That's USR-B, and booting it <strong>uses up its only try</strong>.",
      booted: "B",
      A: part("v1", "fallback", 1, 0, 1),
      B: part("v2", "booting…", 2, 0, 0),
    },
  ];
  const outcome = failBoot
    ? {
        text: "v2 never comes up. On the next boot USR-B has <strong>no tries left</strong> and was <strong>never marked successful</strong>, so GRUB skips it and boots <strong>v1 from USR-A</strong> again. Nobody had to intervene.",
        booted: "A",
        A: part("v1", "rolled back to", 1, 0, 1),
        B: part("v2", "failed to boot", 2, 0, 0),
      }
    : {
        text: "v2 boots cleanly and is <strong>marked successful</strong>. USR-A keeps v1 untouched, and the next update will be written there. The two partitions take turns.",
        booted: "B",
        A: part("v1", "next update goes here", 1, 0, 1),
        B: part("v2", "current release", 2, 0, 1),
      };
  return [...common, outcome];
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k.startsWith("aria-")) node.setAttribute(k, v);
    else node[k] = v;
  }
  node.append(...children);
  return node;
}

export default function mount(root, { reducedMotion = false } = {}) {
  if (!document.getElementById("abw-style")) {
    document.head.append(el("style", { id: "abw-style", textContent: STYLE }));
  }

  let index = 0;
  let failBoot = false;
  let previous = null;

  const rows = {};
  const disk = el("ol", { className: "abw-disk", "aria-label": "Disk partitions" });
  for (const id of ["A", "B"]) {
    const row = {
      li: el("li", { className: "abw-part" }),
      label: el("span", { className: "abw-label", textContent: `USR-${id}` }),
      version: el("span", { className: "abw-version" }),
      badge: el("span", { className: "abw-badge" }),
      attrs: el("ul", { className: "abw-attrs", "aria-label": `USR-${id} GPT attributes` }),
      bar: el("div", { className: "abw-bar", hidden: true }, el("span")),
    };
    row.li.append(row.label, row.version, row.badge, row.attrs, row.bar);
    rows[id] = row;
    disk.append(row.li);
  }

  const text = el("p", { className: "abw-text", "aria-live": "polite" });
  const back = el("button", { type: "button", textContent: "Back" });
  const next = el("button", { type: "button", className: "abw-next", textContent: "Next" });
  const count = el("span", { className: "abw-count" });
  const failInput = el("input", { type: "checkbox" });
  const toggle = el("label", { className: "abw-toggle" }, failInput, "Make v2 fail to boot");

  const controls = el("div", { className: "abw-controls" }, back, next, toggle, count);
  root.append(el("div", { className: "abw" }, disk, text, controls));

  function animateBar(bar) {
    const fill = bar.firstChild;
    if (reducedMotion || !fill.animate) return;
    fill.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: 1400, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards",
    });
  }

  function render() {
    const all = steps(failBoot);
    const step = all[index];
    for (const id of ["A", "B"]) {
      const p = step[id];
      const r = rows[id];
      const booted = step.booted === id;
      r.li.classList.toggle("is-booted", booted);
      r.badge.textContent = booted ? "booted" : "passive";
      r.version.replaceChildren(p.version, el("small", { textContent: p.note }));

      const before = previous && previous[id];
      r.attrs.replaceChildren(...["priority", "tries", "successful"].map((k) =>
        el("li", {
          textContent: `${k}=${p[k]}`,
          className: before && before[k] !== p[k] ? "is-changed" : "",
        })));

      r.bar.hidden = !p.progress;
      if (p.progress && !(before && before.progress)) animateBar(r.bar);
    }
    text.innerHTML = step.text;
    back.disabled = index === 0;
    next.textContent = index === all.length - 1 ? "Start over" : index === 2 ? "Reboot" : "Next";
    count.textContent = `Step ${index + 1} of ${all.length}`;
    previous = step;
  }

  back.addEventListener("click", () => { index = Math.max(0, index - 1); render(); });
  next.addEventListener("click", () => {
    const last = steps(failBoot).length - 1;
    if (index === last) { index = 0; previous = null; } else index += 1;
    render();
  });
  failInput.addEventListener("change", () => { failBoot = failInput.checked; render(); });

  render();
}
