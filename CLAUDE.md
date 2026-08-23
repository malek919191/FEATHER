# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Before touching anything: wait for «انطلق»

**Nothing in this repository changes until the user writes the word `انطلق` ("go").** This rule sits first because it comes before every other rule in time: none of them apply until this one has been satisfied.

Until that word arrives, the permitted work is:

- reading files, searching the code, running read-only commands;
- analysing, explaining, comparing options, estimating effort, pointing out risks;
- proposing a plan, and writing example code **into the chat — never into a file**.

Until that word arrives, all of the following are forbidden, with no exception:

- editing, creating, or deleting any file in the repository — `index.html`, `CLAUDE.md`, and everything else;
- `git commit`, `git push`, `git merge`, `git revert`, `git checkout -b`, or any command that changes repository state;
- opening or merging a pull request;
- downloading, vendoring, or otherwise adding any file to the project.

How to read the signal:

1. **The word is the signal — agreement is not.** "sounds good", "yes", "I like it", "منيح", "تمام", "احسن" are opinions on a plan, not permission to act on it. A conversation can look like consent for many turns and still never contain `انطلق`.
2. **A direct order is its own `انطلق`.** "write this into CLAUDE.md", "add the button", "fix this bug" is an instruction to act now — carry it out. `انطلق` is the key for work that was merely *proposed*; it is not a second key demanded for work the user has just plainly ordered.
3. **One `انطلق` covers the plan that was on the table when it was written, and nothing beyond it.** Once that work is delivered the permission is spent. The next piece of work needs its own.
4. **Never bank it.** Do not ask for approval of future changes in advance, and never stretch an old `انطلق` to cover a later idea.
5. **When unsure, stop.** Ending a turn with "waiting for انطلق" is always a safe outcome. An unrequested change to the user's app never is.

The reason is not ceremony. The user does not read code: a change he did not ask for is one he cannot see coming and cannot audit afterwards — he discovers it only when the app behaves differently in his hand.

## Overview

**FEATHER (Featherweight)** is a fully on-device image compression and editing tool, built as a single file: `index.html`. There is no backend, no network call, and no image is ever uploaded anywhere — all processing happens locally through the Canvas API and vanilla JavaScript.

It is designed as a mini PWA for mobile, particularly iOS — see the `apple-mobile-web-app-capable` and `viewport-fit=cover` meta tags, and the `env(safe-area-inset-*)` handling.

### Features (all inside `index.html`)

1. **Multi-image selection** via `<input type="file" multiple accept="image/*">`.
2. **Output format**: Source (keep the original format), JPEG, or PNG.
3. **Output dimensions**: presets (900/700/500/350px on the longest side) or custom W/H, with automatic aspect-ratio locking.
4. **Compression quality** (30%–90%) — automatically disabled when the target format is lossless (PNG).
5. **Sharpness** (unsharp mask, 0–1, default 0): a slider on the main screen sets it for every photo, and a second slider in the compare viewer sets it for one photo, detaching that photo from the global value until its `Reset`. It applies at any output size, not only when the image is downscaled.
6. **Built-in cropper**: crop with preset or free ratios, 90° rotation, horizontal/vertical flip, free tilt (−90°…90°, with a triangle button that levels the tilt alone), a rule-of-thirds grid, and drag grips that work with both touch and mouse.
7. **Before/after compare viewer**: a drag slider comparing the original against the compressed result, showing dimensions and byte size for each. Changing sharpness here re-encodes that photo at its real output size, so the figures shown are the ones that will save.
8. **Sharing** via `navigator.share` (Web Share API) — opens the iOS share sheet so the user can save to Photos or Files.
9. **Press and hold a photo in the list**: it is magnified 2x, anchored under the finger and dragged 1:1 with it, and steps through compressed → original → compressed (three quarters of a second, then a second and a half), with a tag naming whichever is showing. Lifting the finger restores the card in one frame. The photos themselves are `pointer-events:none` so the press lands on `.shot` instead — an image under the touch is what makes iOS open its own full-screen preview over the app.
10. **PDF output**: a full-width `Save PDF` button beneath `Choose Photos` and `Save`, enabled with them. It wraps the results into one PDF, a page per photo at 150dpi, and opens the share sheet. A JPEG result is embedded byte for byte via `/DCTDecode`, so the page holds exactly the file shown on screen and nothing is compressed twice; a PNG result is encoded to JPEG for the document only, leaving the saved PNG untouched. The writer (`pdfOutBuild`) is ours — no library — and is not part of the isolation contract below.
11. **PDF input**: the picker also accepts PDF files. Each page is rendered to an image and enters the list as its own photo card, so a five-page document becomes five photos, each with its own crop, sharpness and size. It works on any PDF, not only scans — a page of text or a signature is rendered exactly as it appears. Capped at 30 pages per file, 2200px on the longest side. All of it lives in the fenced block governed by the isolation contract below.
12. **Language**: a two-part toggle beneath the app name switches the whole interface between English and Arabic, and the choice is kept in `localStorage` under `fw-lang` so the app reopens in it. Every visible string lives in the `STR` object and is written into the `data-t` / `data-tp` / `data-ta` marks in the markup by `applyLang()`; a switch touches text only and never re-runs the pipeline, so results already on screen keep their exact bytes. `setStatus()` therefore stores a key rather than finished text, and `paintStatus()` / `paintSave()` repaint whatever is showing. Arabic letters join up, so `body.ar` lifts the monospace face and the letter-spacing from the labels and gives the running text its own `direction:rtl`; the layout itself is not mirrored.

### Processing pipeline

Before any of it, `acceptFiles()` receives whatever the picker handed over; PDF pages have already become ordinary image files by then (see the isolation contract), so the pipeline itself only ever sees images.

`decode()` (`createImageBitmap`, falling back to `<img>`) → `cropAndOrient()` (applies crop + rotation + flip with exact coordinate-space transforms) → `stepDown()` (progressive halving rather than a single downscale, to avoid aliasing) → `sharpen()` (a simple unsharp mask via hand-rolled convolution over `ImageData`, skipped entirely at 0) → `toBlob()` for final encoding.

A free tilt cannot be expressed as a source rectangle, so `cropAndOrient()` branches to `cropTilted()`, which replays the whole transform at source resolution and lifts the crop out of it. Edits with no tilt keep the original source-rect path, so that path must stay intact.

Each image is processed independently and asynchronously, guarded by a `token` counter that cancels stale work when the user changes settings mid-run (race-condition guard). `results` is keyed by photo index rather than pushed, because the viewer re-encodes a single photo in place; `sharpToken` guards that path the same way.

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

The current version in `index.html` is **`v1.7.1`**.

## Git workflow and release history

Every change to this app ships as a GitHub commit, and the commit history **is** the backup — nothing is archived separately, and any past version can be viewed or restored from the log at any time. Keep that discipline.

**Working mode:** a local clone, committed and pushed with `git` directly.

**Note on history:** this repository is the project's current home. Versions `v0.0` through `v1.1` were developed in `malek919191/Featherweight`, which remains as the archive of that earlier history — which is why the log here is short.

1. **The commit message is how a version is found again — never "Update index.html".** There are no git tags in this project, and none are wanted: the message alone carries the whole index, so it has to earn that on its own.

   **A commit that bumps the version must open with the number,** followed by an em dash and the changes as they appear on screen:

   ```
   v1.0 — custom size fields, crop delete button, reset button
   ```

   Messages are written in English. What matters is the register, not the language: name controls and behaviour the user can see, never the functions behind them. `v1.3 — wider tilt range, level button, and sharpness control` describes the screen; `v1.3 — refactor cropAndOrient, add cropTilted branch` names internals the user has never seen and cannot search for. Keep function names for the body, where they belong.

   That first line is what makes `git log --grep="^v1\.2"` land on the release in one step, so the version must lead it and never sit mid-sentence. List the actual changes, not a category: "free tilt in the cropper, sharpening and PNG-8 removed" is findable a year later; "various improvements", "several fixes" and "update cropper" are not, and are not acceptable. If a change is invisible to the user, say what it is instead of dressing it up.

   Use the body beneath that line for what the summary cannot hold: why the change was made, what it breaks, how it was verified. Commits that do not bump the version follow the same standard, minus the number.

   Earlier history is largely unlabeled; this is the single biggest gap, and it must not continue.
2. **Never force-push, and never rewrite history.** History is linear and additive, always — including experiments that were later reverted. Every version must stay retrievable forever.
3. **Use commit boundaries.** Split logically separate work into separate commits ("refactor crop math", then "add reset button") rather than one large bundle, so a regression can be traced to a single commit.
4. **Rolling back** means `git revert` (preferred — it keeps history intact), or committing the old file content forward as a new commit. Never delete or rewrite the commits in between.

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
6. **Do not simplify or replace the hand-written algorithms** (`stepDown` progressive downscaling, `sharpen` unsharp mask, `cropTilted` tilt transform) with external libraries or browser alternatives (such as the `image-rendering` CSS property) without an explicit request — these are deliberate choices that preserve image quality without dependencies.
7. **Always free memory**: every `ImageBitmap`, `<canvas>`, and Object URL created must be released via `release()` / `kill()` / `URL.revokeObjectURL()` on the correct path, including error paths, to avoid leaking memory on mobile — images can be very large.
8. **Do not change the developer byline** (`Malek Barbari` in `.byline` and `footer`) unless explicitly asked. The **version number, by contrast, must be updated** with every functional or cosmetic change, following the Versioning section above — never leave a change without the appropriate bump.
9. **Match the existing code style** (ES5-ish, no frameworks, the same terse variable naming already used in the file) rather than rewriting it in a modern idiom, to keep the file coherent and diffs small.
10. **Never break the PDF isolation contract** — see the section of that name below. PDF-reading code stays inside its fenced block, behind its kill switch, and out of every other function in the file.
11. **Any UI change (colours, fonts, layout) must preserve the current visual character** — the "paper/receipt" palette (`--paper`, `--card`, `--ink`, and `--stamp` in red as a rubber-stamp accent) — unless a new design is explicitly requested.

## PDF: the isolation contract

Reading PDF files is the only part of FEATHER that leans on code we did not write — the `pdf.js` library, vendored inside the repository. The user accepted it on one condition, agreed in full before a single line was written: **it must stay removable at any point in the future, in minutes, with no thinking required, no matter how many versions have been built on top of it.**

`git revert` is explicitly **not** the removal plan. By the time removal is wanted, dozens of features will sit above that commit and a revert would collide with all of them — the user said so himself, and he is right. History is not the guarantee; **construction is**. What follows is that construction. These are binding rules, not style preferences.

**Status:** implemented in v1.9, under a contract written and agreed first.
**Recipe last verified against:** v1.9. Re-verify and update this line every time the block is touched.
**Library:** pdf.js 3.11.174, legacy build, from the npm package `pdfjs-dist`, vendored unmodified in `vendor/`.

### 1. One door

Images enter FEATHER at exactly one place: the file picker, where the chosen files become `sourceFiles`. PDF gets a single function there — a door that receives the picked files and hands back ordinary image blobs. Everything downstream — `decode`, `cropAndOrient`, `stepDown`, `sharpen`, the cropper, the compare viewer, sharing, the language layer — sees images and only images, and must never learn that PDF exists.

### 2. One fenced block, at the end of the script

Every line of PDF code lives inside one contiguous block, between these two markers and nowhere else:

```
// ===== PDF IN — start · everything between these markers is deletable =====
// ===== PDF IN — end =====
```

The block sits **at the very end of the script**, after all other code, so nothing of ours ever grows inside it and the deletable range stays one unbroken run of lines. The markers are permanent, and they are how the block is found years from now by someone who has never read this file.

The full removal recipe is repeated **as a comment directly above the opening marker**, so the instructions live next to the thing they describe and cannot drift away from it.

### 3. One kill switch, inside the block

```
var PDF_IN = true;   // false switches PDF reading off entirely
```

It is declared **inside** the block, at its top — never above it — so it has no separate existence to clean up. Setting it to `false` must always be enough to turn the feature off completely: the picker goes back to images only, the door stays shut, nothing else in the app changes. If a change would make that untrue, the change is wrong.

### 4. The block reaches out; nothing reaches in

The rest of `index.html` must never be edited to accommodate PDF. Where the feature needs something outside itself, the block does it **at runtime, from inside**:

- **The picker's `accept`.** The markup keeps `accept="image/*"` unchanged, forever. When it runs, the block widens the attribute itself to also accept PDF. Delete the block and the picker is back to images with nothing to restore.
- **The status strings.** They are not typed into the `STR` object next to the app's own strings. The block adds its own keys to `STR.en` and `STR.ar` when it runs. Delete the block and they go with it. Every key it adds is named with a `pdfIn` prefix.
- **The library itself.** There is no `<script>` tag for it in the markup. The block injects the script at runtime, the first time a PDF is actually picked, and remembers that it did. This keeps the head clean, keeps the audit in section 6 exhaustive, and means a user who never opens a PDF never downloads the megabyte at all. With `PDF_IN` set to `false` the library is never fetched.
- **Naming.** Every function, variable, and key this feature introduces begins with `pdfIn` — or `PDF_IN` for the switch. Never a bare `pdf`, which belongs to PDF output (see the last section). This is what makes the audit in section 6 exhaustive rather than hopeful.

The single exception is the one call, in section 5.

### 5. Exactly one line outside the block

Reading a PDF is asynchronous — pages have to be rendered — so the door cannot simply return files the way a synchronous call would. It therefore takes the picked files **and** the function that consumes them, and calls it when the images are ready. When there is no PDF among the files, or `PDF_IN` is `false`, it passes them straight through untouched.

That keeps the intrusion to one line at the file picker, carrying on it both its marker and its own replacement text:

```
pdfInDoor(picked, acceptFiles);   // PDF IN — on removal, replace this line with:  acceptFiles(picked);
```

That is the **only** line of PDF anywhere outside the fenced block. There is never a second one.

**One permanent refactor comes with it, and it is not PDF code.** The body of the picker's `change` handler moves into a plain function, `acceptFiles(files)`. It contains no PDF, mentions no PDF, and **stays in the app after removal** — it is simply the app's own code, given a name. It is listed here so a future reader knows it is not part of the feature and must not be deleted with it.

### 6. The audit — how erosion is detected

A written rule that nobody checks is a rule that rots. This one is checkable in a single command:

```
grep -in "pdfin\|pdf_in" index.html
```

**Every hit must fall inside the fenced block, or be the one marked call line in section 5. A hit anywhere else means the isolation is broken.**

The search is for `pdfIn` / `PDF_IN`, not for the bare word `pdf`, because PDF *output* is a separate feature of our own that legitimately uses `pdf` throughout and would drown the result. That naming split (rule 4) is what keeps this audit exact. A second, softer look —

```
grep -in "pdf" index.html
```

— should show nothing except PDF output and the hits above; anything else is a stray that needs a home.

This runs **before every commit that touches `index.html`**, not only when working on PDF. A hit outside those two places stops the commit until it is moved back inside the block. No exceptions, no "just this once" — that is precisely how the hundredth update ends up tangled.

### 7. Forbidden, always

- PDF logic anywhere outside the fenced block.
- Any downstream function branching on "did this come from a PDF".
- Any state, flag, or field recording a photo's PDF origin that is read outside the block.
- Editing the vendored library. It is frozen at the committed version — never patched, never silently updated.
- Letting a PDF failure take anything else down: the block catches its own errors, reports them in both languages, and images keep working.

### 8. The duty to warn

If a future feature cannot be built without breaking this isolation, **say so in the chat before building it** — name exactly what it breaks and what removal will cost afterwards — and let the user decide. Never quietly weaken the isolation because it makes a feature easier to write.

### 9. What PDF reading physically consists of

The complete inventory. Nothing else in the repository belongs to this feature:

| # | What | Where | How to find it |
|---|---|---|---|
| 1 | The vendored library, and its licence file | `vendor/` | The folder holds nothing else |
| 2 | All our PDF code, including `PDF_IN` | `index.html`, end of the script | Search for `PDF IN — start` |
| 3 | The single call to the door | `index.html`, at the file picker | Search for `PDF IN — on removal` |

Deliberately **not** by line number: line numbers drift with every release and would send a future reader to the wrong place. Search strings do not drift.

Not in this inventory, and therefore not part of the feature: `acceptFiles` (section 5), the picker's `accept` attribute, and everything belonging to PDF output.

### 10. The removal recipe

Two deletions and one one-line replacement, in any order. Nothing here is "work out what used to be there and put it back", because rule 4 means the app was never altered to accommodate PDF — and the one line that is not a deletion carries its own replacement text written on it.

1. Delete the folder `vendor/`. There is no `<script>` tag to remove — the block loaded the library itself.
2. Delete everything from `// ===== PDF IN — start` to `// ===== PDF IN — end` inclusive, in `index.html`.
3. Find the line marked `// PDF IN — on removal, replace this line with:` and do exactly what it says — the replacement is spelled out on the line itself.

Then:

4. Run `grep -in "pdfin\|pdf_in" index.html`. It must return **nothing at all**. Any remaining hit is code written in violation of this contract, and it has to go too.
5. Bump the version and commit forward. Never revert history.

**`grep -in "pdf"` will still return hits after a correct removal, and that is right, not a mistake.** Those hits are PDF output, a different feature. Deleting them would break the app. Step 4 searches for `pdfIn` / `PDF_IN` precisely so the two are never confused.

**Do not delete these** — they are the app's own, and PDF only borrowed them:

- `accept="image/*"` on the picker. It was never changed, and it must stay.
- `acceptFiles`, and `sourceFiles`, and everything that reads them.
- The `STR` object and every string in it that has no `pdfIn` prefix.
- **PDF output** — every `pdfOut…` name, its button, and its strings. See the section below. It is unrelated to any of this and survives removal untouched.

### 11. Verifying after removal

The point of this contract is that the app is *unaffected*. Confirm it on the phone, in this order — all of it must behave exactly as before:

1. Choose two photos. Both appear and compress.
2. Crop one, rotate it, tilt it. The preview follows.
3. Open the compare viewer and drag the slider. Both figures show.
4. Move the sharpness slider. The photo re-encodes.
5. Share a result. The iOS sheet opens.
6. Switch the language both ways. Every label changes and no result is lost.

If all six pass, removal is clean.

### 12. When this contract has been broken

**The day the recipe in section 10 stops being the whole list, rules 1–7 have been broken.** Do not work around it and do not extend the recipe to cover the mess. Bring the file back into line first — move the stray code back inside the block until `grep -in "pdfin\|pdf_in" index.html` is clean again — and only then ship anything else.

### Not covered by any of this

**PDF output** — building a PDF out of already-compressed images — is our own code: no library, no dependency, no foreign anything. It is an ordinary feature of the app, removable like any other, and none of the rules above apply to it. It does not live in the fenced block, and it survives the removal recipe untouched.

To keep the two from ever being confused, its own names carry a `pdfOut` prefix — matching the `pdfIn` prefix that marks the removable side. The prefixes are the whole reason a single `grep` can tell them apart years from now.

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
