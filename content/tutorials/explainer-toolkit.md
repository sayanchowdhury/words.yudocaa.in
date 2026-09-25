---
title: "Explainer toolkit: every component on one page"
date: 2026-09-24
draft: true # Authoring reference. Preview with `hugo server -D`.
description: "What each explainer and tutorial component looks like, and the Markdown that produces it."
topics: [containers-linux]
series: [Explainer toolkit]
weight: 1
difficulty: intermediate
duration: 15 min
prerequisites:
  - A Flatcar VM or any Linux box with `bash`
  - "`kubectl` 1.34 or newer"
---

This page is a reference while writing. Every block below is produced by a
shortcode, a render hook or front matter. There is no custom HTML in the post.

## Tutorial front matter

`difficulty`, `duration` and `prerequisites` render the strip under the title.
`series` plus `weight` add the "Part N of M" box and the next/previous links at
the bottom. `topics` takes one or two of: `containers-linux`, `kubernetes`,
`ai-infra`, `open-source`.

## Margin notes

Plain Markdown footnotes become margin notes on wide screens.[^margin] On
narrower screens they stay at the bottom of the page as usual.[^second]

[^margin]: Like this one. It sits in the left margin, level with the paragraph that refers to it.
[^second]: Several notes on one paragraph stack instead of overlapping.

## Callouts

{{< callout >}}
A plain note. Use it for context the reader can skip.
{{< /callout >}}

{{< callout type="tip" title="Faster feedback" >}}
Run `hugo server -D --navigateToChanged` and the browser jumps to the file you edit.
{{< /callout >}}

{{< callout type="warning" >}}
Updates reboot the node. Drain it first with `kubectl drain`.
{{< /callout >}}

{{< callout type="danger" title="Destructive" >}}
`wipefs -a` erases the partition table. Double-check the device name.
{{< /callout >}}

## Steps

{{% steps %}}

### Check the running version

```sh
cat /etc/os-release
```

### Ask update_engine for its status

```sh {filename="check-update.sh"}
update_engine_client -status
```

### Reboot into the new version

Once the status says `UPDATE_STATUS_UPDATED_NEED_REBOOT`, reboot.

{{% /steps %}}

## Tabs

Tabs that share a `group` switch together, and the choice is remembered.

{{< tabs group="os" >}}
{{< tab "Flatcar" >}}
```sh
sudo systemctl restart update-engine
```
{{< /tab >}}
{{< tab "Ubuntu" >}}
```sh
sudo apt update && sudo apt upgrade
```
{{< /tab >}}
{{< /tabs >}}

{{< tabs group="os" >}}
{{< tab "Flatcar" >}}
Flatcar has no package manager, so the OS updates as a single image.
{{< /tab >}}
{{< tab "Ubuntu" >}}
Ubuntu updates package by package.
{{< /tab >}}
{{< /tabs >}}

## Diagrams

```mermaid {caption="Release branches, simplified."}
flowchart LR
  main -->|branch cut| rc[release-1.x]
  rc --> beta --> ga[GA]
  ga --> patch[patch releases]
```

## Terminal recordings

{{< asciinema src="/casts/sample.cast" title="Recordings load when scrolled into view." rows="8" cols="80" >}}

## Live widgets

{{< widget name="flatcar-ab-update" caption="Step through a Flatcar update and try a failed boot." >}}
Flatcar keeps two `/usr` partitions. Updates go to the one not in use, and
the bootloader falls back if the new version fails to boot.
{{< /widget >}}
