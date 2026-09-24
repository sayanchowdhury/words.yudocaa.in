---
title: "Explainer toolkit: writing a widget"
date: 2026-09-25
draft: true # Authoring reference. Preview with `hugo server -D`.
description: "How to add a new live widget."
series: [Explainer toolkit]
weight: 2
difficulty: advanced
duration: 10 min
---

## The contract

A widget is an ES module at `static/widgets/<name>.js`. Its default export
receives the root element and `{ reducedMotion }`:

```js {filename="static/widgets/hello.js"}
export default function mount(root, { reducedMotion }) {
  root.textContent = "Hello from a widget";
}
```

Embed it with the text to show when JavaScript is off:

```go-html-template
{{</* widget name="hello" */>}}Fallback Markdown.{{</* /widget */>}}
```

Widgets load only when scrolled near. If a widget throws, the fallback stays.
Use the site's CSS variables (`--accent`, `--border`, `--code-bg`, `--radius`)
so it follows light and dark mode.
