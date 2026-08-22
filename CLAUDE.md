# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**FEATHER (Featherweight)** is a fully on-device image compression and editing tool, built as a single file: `index.html`. There is no backend, no network call, and no image is ever uploaded anywhere — all processing happens locally through the Canvas API and vanilla JavaScript.

It is designed as a mini PWA for mobile, particularly iOS — see the `apple-mobile-web-app-capable` and `viewport-fit=cover` meta tags, and the `env(safe-area-inset-*)` handling.

### Features (all inside `index.html`)

1. **Multi-image selection** via `<input type="file" multiple accept="image/*">`.
2. **Output format**: Source (keep the original format), JPEG, PNG, or PNG-8 (256→64 colours via a custom median-cut quantizer).
3. **Output dimensions**: presets (900/700/500/350px on the longest side) or custom W/H, with automatic aspect-ratio locking.
4. **Compression quality** (30%–90%) — automatically disabled when the target format is lossless (PNG).
5. **Built-in cropper**: crop with preset or free ratios, 90° rotation, horizontal/vertical flip, a rule-of-thirds grid, and drag grips that work with both touch and mouse.
6. **Before/after compare viewer**: a drag slider comparing the original against the compressed result, showing dimensions and byte size for each.
7. **Sharing** via `navigator.share` (Web Share API) — opens the iOS share sheet so the user can save to Photos or Files.

### Processing pipeline

`decode()` (`createImageBitmap`, falling back to `<img>`) → `cropAndOrient()` (applies crop + rotation + flip with exact coordinate-space transforms) → `stepDown()` (progressive halving rather than a single downscale, to avoid aliasing) → `sharpen()` (a simple unsharp mask via hand-rolled convolution over `ImageData`) → `quantize()` (PNG-8 only, custom median-cut) → `toBlob()` for final encoding.

Each image is processed independently and asynchronously, guarded by a `token` counter that cancels stale work when the user changes settings mid-run (race-condition guard).

## Structure and development

- **No build step, no package manager, no external dependencies.** `index.html` holds everything: HTML + CSS (in `<style>`) + JS (a single `"use strict"` IIFE in one `<script>`).
- **No test suite and no linter are configured in this project.**
- **To run or preview**: open `index.html` directly in a browser, or serve it statically (e.g. `python3 -m http.server`). There are no build or npm commands, because there is no `package.json`.
- The code style in the file is roughly ES5: `var`, traditional `function` declarations, no `class`, arrow functions, or modern async/await except in a few places. No framework.

## Versioning

**Format:** `MAJOR.MINOR.PATCH` — e.g. `v2.7.1`

| Part | Increments on |
|---|---|
| **MAJOR** | Structural rebuild or fundamental change to the app |
| **MINOR** | New feature or behaviour change |
| **PATCH** | Cosmetic or experimental tweak, with no functional change |

**Precise rules — note that these deviate from standard SemVer:**

1. **PATCH branches off the current version, not the next one.** A cosmetic fix on `v2.7` becomes `v2.7.1` — **not** `v2.8.1`.
2. **When MINOR increments, PATCH is dropped entirely rather than zeroed.** `v2.7.2` → `v2.8` — **never** write `v2.8.0`.
3. **When MAJOR increments, MINOR resets to zero and PATCH is dropped:** `v2.8.3` → `v3.0`.
4. **Changes that do not touch the app get no version at all.** Documentation (`CLAUDE.md`, `README.md`), commit messages, and code comments change nothing the user can see or use — the number in the app header tracks the app, not the repository.

**Example progression:**

```
v2.7  →  cosmetic tweak       →  v2.7.1
      →  cosmetic tweak       →  v2.7.2
      →  new feature          →  v2.8      (not v2.8.0)
      →  structural rebuild   →  v3.0
```

**Where it is displayed:** the version appears inside the app itself — **top-right, beneath the words `on-device`** — in the `<span class="ver">` inside `.meta-right` in `index.html`. Any bump must be applied there as part of the same change.

The current version in `index.html` is **`v1.1`**.

## Git workflow and release history

Every change to this app ships as a GitHub commit, and the commit history **is** the backup — nothing is archived separately, and any past version can be viewed or restored from the log at any time. Keep that discipline.

**Working mode:** a local clone, committed and pushed with `git` directly.

**Note on history:** this repository is the project's current home. Versions `v0.0` through `v1.1` were developed in `malek919191/Featherweight`, which remains as the archive of that earlier history — which is why the log here is short.

1. **Write a real commit message — never "Update index.html".** State what actually changed, and lead with the version when one is released:
   `v1.0 — custom size fields, crop delete button, reset button`
   Earlier history is largely unlabeled; this is the single biggest gap, and it must not continue.
2. **Tag released versions.** When you bump the number in `index.html`, say so explicitly in the commit message and add a matching git tag (`v1.0`, `v1.1`, …), so a released version can be found without scrolling the log.
3. **Never force-push, and never rewrite history.** History is linear and additive, always — including experiments that were later reverted. Every version must stay retrievable forever.
4. **Use commit boundaries.** Split logically separate work into separate commits ("refactor crop math", then "add reset button") rather than one large bundle, so a regression can be traced to a single commit.
5. **Rolling back** means `git revert` (preferred — it keeps history intact), or committing the old file content forward as a new commit. Never delete or rewrite the commits in between.

### How changes get verified

**The user does not read code.** Verification happens one way only: he opens the live site in Safari on an iPhone once the commit has landed and GitHub Pages has redeployed (roughly 30–60 seconds), and his only diagnostic tool is a screenshot of what he sees on screen.

Live site: `https://malek919191.github.io/FEATHER/`

This has hard consequences for every change shipped:

- **Never report a change as verified because the code looks correct.** It is verified when he sees it working on the phone — say what is committed, then hand him the check to run.
- **Say plainly what to look for and what to tap.** Name the exact control, where it sits on screen, and what should happen. For example: "tap the pencil icon at the top-right of any photo, rotate once, and the preview beneath it should turn sideways."
- **When a change is invisible** (documentation, refactoring with no behavioural change), say so explicitly instead of sending him to test something he cannot see.
- **When he reports a break with a screenshot**, read what is actually on screen before theorising, and explain the cause in plain language before proposing a fix.

## Strict rules for making changes

1. **Never send any image or user data to any server or external API.** The app's core promise is "Nothing leaves your phone" (stated explicitly in the UI) — adding any network request (fetch/XHR) for image processing breaks that promise and is unacceptable.
2. **Never add an external dependency** (no CDN, no npm package, no framework such as React or Vue). The app must remain a single self-contained file that works fully offline.
3. **Do not introduce build tools or bundlers** (webpack, vite, etc.) or split the code across multiple files unless explicitly asked — the simplicity of one copyable, directly-openable file is a deliberate feature.
4. **Preserve iOS/PWA compatibility**: any change to `<head>` or to the meta tags (`viewport`, `apple-mobile-web-app-*`, `theme-color`, `color-scheme`) must stay compatible with current iOS Safari behaviour, and the `env(safe-area-inset-*)` handling must not be removed.
5. **Preserve the `token` counter logic** in async operations (`showOriginals`, `run`, and so on) whenever touching the processing pipeline — it is what prevents stale results from racing in when the user changes settings mid-processing.
6. **Do not simplify or replace the hand-written algorithms** (`stepDown` progressive downscaling, `sharpen` unsharp mask, `quantize` median-cut) with external libraries or browser alternatives (such as the `image-rendering` CSS property) without an explicit request — these are deliberate choices that preserve image quality without dependencies.
7. **Always free memory**: every `ImageBitmap`, `<canvas>`, and Object URL created must be released via `release()` / `kill()` / `URL.revokeObjectURL()` on the correct path, including error paths, to avoid leaking memory on mobile — images can be very large.
8. **Do not change the developer byline** (`Malek Barbari` in `.byline` and `footer`) unless explicitly asked. The **version number, by contrast, must be updated** with every functional or cosmetic change, following the Versioning section above — never leave a change without the appropriate bump.
9. **Match the existing code style** (ES5-ish, no frameworks, the same terse variable naming already used in the file) rather than rewriting it in a modern idiom, to keep the file coherent and diffs small.
10. **Any UI change (colours, fonts, layout) must preserve the current visual character** — the "paper/receipt" palette (`--paper`, `--card`, `--ink`, and `--stamp` in red as a rubber-stamp accent) — unless a new design is explicitly requested.

## Communicating with the user

**The user has zero programming experience.** This is not a minor detail; it shapes every response:

- Number and order the steps, and assume no prior knowledge.
- Do not merely name a button or a command — say exactly where it is, what happens after running it, and how to tell that it worked.
- Explain a technical concept by its practical effect on the app, not by its theoretical definition.
- Warn before a risky or irreversible step, not after it.
- When something fails, explain why in plain language before proposing a fix.

### Writing Arabic

The user writes in Arabic. When replying in Arabic, write Latin terms as they are, prefixed with `‹` and with no closing mark:

> المعالجة تتم عبر ‹Canvas API داخل المتصفح.

**Four rules:**

1. **Do not Arabize well-known names and terms** — the user reads English comfortably.
2. **Arabize only a term that will recur often** in the text. Define it at first mention (`كوورك ‹Cowork`) and use the Arabized form alone thereafter.
3. **Never begin an Arabic sentence with a Latin word.**
4. **Never place a Latin word directly against a comma, a period, or a number** — follow it with an Arabic word, because that adjacency breaks text direction in Arabic.

**Exceptions that stay Latin with no `‹` prefix:**

Filenames (`index.html`), code (`toBlob()`), commands (`git push`), extensions (`.js`), and paths (`/home/user/`).
