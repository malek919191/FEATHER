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
2. **Output format**: Source (keep the original format), JPEG, PNG, or WEBP. The fourth button is not offered on a promise: a browser that cannot encode WEBP does not refuse, it quietly returns a PNG under the WEBP name, which would come out heavier than the photo went in. `webpProbe()` therefore encodes one 1x1 canvas at startup and checks the blob type that actually comes back; only then is the button unhidden and `#formats` widened to four columns. Where the probe fails the button is removed from the DOM and the row stays exactly the three it has always been.
3. **Output dimensions**: presets (900/700/500/350px on the longest side) or custom W/H, with automatic aspect-ratio locking.
4. **Compression quality** (30%–90%) — automatically disabled when the target format is lossless (PNG).
5. **Sharpness** (unsharp mask, 0–1, default 0): a slider on the main screen sets it for every photo, and a second slider in the compare viewer sets it for one photo, detaching that photo from the global value until its `Reset`. It applies at any output size, not only when the image is downscaled. Both sliders are `Advanced`'s: in `Simple` they are folded away and every photo takes its preset's own value — see **Two modes**.
6. **Built-in cropper**: crop with preset or free ratios, 90° rotation, horizontal/vertical flip, free tilt (−90°…90°, with a triangle button that levels the tilt alone), a rule-of-thirds grid, and drag grips that work with both touch and mouse.

   **Four points, not four corners.** The shape of the crop is picked from a row of three above the ratios — `Normal`, the ordinary four-cornered rectangle; `Custom`, a shape placed by hand; and `Curve`, the same shape with edges that bend. `Custom` turns the rectangle into a shape with no right angles: four handles on the corners of whatever was photographed, and four on the middles of the edges, each of those a point in its own right — it moves alone, leaving the two corners holding its edge exactly where they were, and puts a real corner in the middle of that edge. Move all four and the shape has eight sides, every one straight, with four genuine angles in it. Carrying a whole edge is still one gesture and always was: the edge itself, grabbed anywhere along it but the handle. It is for the page, the whiteboard or the painting shot from the side, which does not come back tilted but as a trapezium — the far edge shorter than the near one, opposite edges not even parallel. No rotation straightens that and the tilt slider cannot either; only pulling the four corners back onto a true rectangle does, which is a perspective transform. **The proportions the page really had.** An angle shortens whichever side of a page leans away from the lens, so measuring the four sides as they lie in the photo measures them already shortened — which is why a page photographed on a table used to come back square. `qAspect()` recovers the true proportions from the same four corners together with the lens the photo states, and `qFit()` stretches the side that was leaning back out, never shrinking the other, so nothing the photo holds is thrown away. Measured against a simulated camera: a page at 45° was 57% out before and is now under half a percent; on a table at 55° it was 80% out. Solving for the lens from the four corners instead is possible on paper and useless in the hand — it works by running the edges out to where they would meet, far outside the picture, and a corner placed two screen pixels out swings that meeting point wildly: measured against a shaky finger the stated lens held the answer inside a tenth while solving for it swung between half short and a quarter over. A file with no lens in it — a screenshot, a rendered page, a photo another app re-saved — falls back to an ordinary phone camera, and even a guess a third out beats measuring the sides as they lie. What the recovery needs is corners placed with some care, which is what the magnifier is for; it is at its best when the page fills a good part of the frame, which is what anyone photographing a page to read it does anyway.

   **What counts as a legal shape is measured at the size the photo is fitted at, never at the size it is zoomed to.** The shortest edge a shape may have is thirty pixels on the glass, so that a handle stays grabbable; measured against the zoom instead, an edge pulled short at four times magnification was legal there and illegal on the way back out, and the shape the app had just accepted became one it refused to move at all — not that corner but every corner, in every direction, which is what a user sees as the app having seized. That was v1.21's, and v1.21.1's measure removes it. Both searches that walk a refused move back to the furthest legal one also gained a way out: where the shape they start from is *already* crossed over or folded, they take the place the finger asked for rather than refusing everything, since that is the only direction back.

   Three things keep it honest. The shape must stay convex, because a folded quadrilateral has no straightening in it — so a handle dragged too far slides along that limit rather than sticking under a finger that is still moving, which would read as the app having seized. The output is measured in the photo's real pixels rather than in the zoomed view, so a tilt does not hand back a fifth-again upscale of the page. And the figure under the photo is the straightened size, not the span of the shape. The four points are held in the photo's own pixels, never in the pixels of the view they were placed through, and that is the whole reason a rotation, a flip or a tilt cannot drag them off the page: those change how the photo is shown, and the points come along for free because they were never described in terms of the view to begin with. Held that way, a tilt out to 25° and back to 0, four turns of 90°, or a flip and a flip back all leave them on exactly the same pixel.

   **Two fingers, because the corner is smaller than the fingertip.** Placing a corner means aiming at a page shown a tenth of the size it really is, which is the one thing the crop asks the user to be exact about. Two fingers on the photo grow it inside the editor — as far as four times the size it is shown at, or until one pixel of the photo is one pixel of the screen, whichever of the two reaches further; one finger moves the photo under the window — anywhere on it except the handles, the inside of the crop's own rectangle included, because a finger meant to bring another part of the page into view must never carry the crop along with it — and pinching back in returns to the whole of it. It is redrawn at the size it is shown, so what appears is the photo's own pixels rather than a stretched picture, and the loupe goes on adding what it still can on top of that.

   **Under `Normal`, the zoom is itself the crop — and a zoom out is what settles it.** Bringing a part of the photo up to fill the window is the shortest way there is to crop to it on a phone. So the rectangle holds its place *inside the window*, as fractions of it: zooming further in tightens it onto what is being looked at, moving the photo under the window crops elsewhere, and a rectangle that fills the window goes on filling it — the whole photo at full size, the part being looked at once zoomed in. Its shape comes along, because the window keeps its own proportions whatever the zoom does: a ratio chosen from the row, or an edge moved by hand, is still the shape that tightens. **Pulling back out settles it.** From that moment the rectangle is held on the photo's own pixels and nothing the zoom or the pan does moves it again, however far back in the photo is zoomed afterwards — which is the whole point, since a crop framed at four times the size is worth nothing if leaving the zoom hands the whole photo back. Only `Reset`, a ratio button or a 90° turn hands it back to the window. A pinch is never perfectly steady, so the turn back out is read against the furthest that gesture reached rather than against the last frame; a tremor while zooming in cannot settle the crop early. The four points of `Custom` and `Curve` are untouched by any of this — they live in the photo's own pixels — but the rectangle they are laid on is the crop that is showing, so choosing `Custom` while zoomed puts the four corners on what is being looked at rather than on the corners of a photo that is mostly off-screen. They are laid on it afresh **every** time either mode is chosen, until a point or an edge has actually been pulled: the first pull is what gives them their own memory, and before it there is no shape of anyone's to protect.

   **The four points do not move with it, and that is the point.** A zoom is a way of looking, never an edit. The four points are held in the photo's own pixels and so do not move at all, whatever the zoom does; the hand-placed rectangle is held in the pixels of the view and is carried across by the same ratio, landing on the pixels of the photo it was already on. Measured against a simulated pinch: no drift at all on any of the four corners through a zoom, through a pan, and back to full size, with the spot between the fingers staying under them to within a hundredth of a pixel and the figure under the photo unchanged throughout. A crop lifted at three times zoom came out at exactly the size the editor stated. The zoom is not remembered either — every photo opens showing the whole of itself, a 90° turn returns to it, and `Reset` clears it with the rest.

   **`Curve`, for a page that is not flat.** Four straight edges describe a flat page seen from an angle exactly, because a straight line photographed stays straight — that is a law, not an approximation, and where it holds nothing more is needed. It stops holding when the page itself is not flat: a page out of a bound book curves near the spine and its lines of text bow with it, and so does a label on a bottle, a sheet that will not lie flat, or a page shot close on the ultrawide lens, which bows straight edges on its own. `Curve` is for those. It changes nothing about the four corners; it changes what the four middle handles do. Instead of carrying their edge they bend it. And because one bend cannot settle a whole edge, it hangs two more handles on each edge — one either side of the big one — so an edge under `Curve` has three: eight handles become sixteen, and only here. Under `Custom` and `Normal` the two extra ones are not on screen at all, because a `Custom` edge holds one corner and no more and they would have nothing to do; the count itself therefore says which shape is in front.

   **All three handles travel, the big one included.** None of them is pinned to the place it starts at. Until v1.21.11 the big one was: the app held it at the exact middle of its edge whatever the finger did, and gave it only the across-the-edge half of a drag, so sliding it along its own edge moved nothing — and it is the handle a user reaches for first. Now it goes wherever it is taken, and one gesture does both jobs at once with the two halves of the same drag: the part that runs *along* the edge carries the handle to where the finger is along it, and the part that runs *across* bends the edge there. Every handle is therefore simply always under the fingertip, and the edge bends wherever you take it. What holds them apart is a tenth of the edge — from the corner behind and from the next handle along — so that even on the short edge of a photo no two dots come to sit on top of one another. Nothing else pins them: a handle taken towards one end pushes whichever are in its way ahead of it rather than stopping against them, so all three can be gathered onto the part of a page that actually curves, and one pushed that way is set back onto the curve it was already sitting on, so making room never bends anything. Where they were left is remembered per photo, the way the shape and the bend are, and only `Reset` puts them back at a quarter, a half and three quarters.

   **Under `Custom` the edge is the handle; under `Curve` the handles are.** A `Custom` edge is grabbed anywhere along it, never only at the dot sitting on it, because a dot is a small target on a page held at arm's length and the edge running past it is not — and the pull carries the whole edge, the two corners holding it, which is the one thing no handle there does: the midpoint handle puts a corner in the edge instead. One walk serves that corner and the pair that carries the edge, so the handle and the edge itself cannot drift apart.

   A `Curve` edge answers nothing at all. Since v1.21.9 the three handles it carries are the whole of the way in — and they had to be, because once two of them travel the length of the edge, a grab on the edge does the same job a second time and by a second rule, which is exactly the kind of overlap that makes a control hard to describe and hard to trust. One way in, and only one. It buys something back as well: with the shape no longer taking the finger under `Curve`, a finger put on the page moves the photo in the window, the way it does everywhere else in the editor.

   **A bend stays on the photo.** Beyond the photo's edge there is nothing to read: the sampler clamps to the last row of pixels it has, so an output area that fell outside comes back as that row smeared across it — the blank streak down the side of a page. `qBendIn()` holds the bulge inside the photo the way `qBendOK()` holds the fold out of it, and the edge slides along that limit instead of crossing it.

   **The three handles are the edge.** The line runs through all three of them and through the two corners, and that is the whole definition of it — five points, one line. Nothing else about an edge is settable and nothing else needs to be: put the three dots where the page goes and the edge is where the page is.

   **And it bends into the corners.** Until v1.21.13 it did not: a stretch inside every corner — a fourteenth of the edge, at both ends of all four — came back dead straight however hard the edge was bent, because the row of controls stopped short of the corners and nothing that could bend an edge could be heard there. The corner is still the four points' to say and no bend moves one; what has gone is the straight run leading up to it. Measured on the app's own drawing, an edge asked for a book-page arc missed the line it was given by 0.008 of the square inside the corner and now misses it by 0.00002 — the drawn edge and the line asked for are the same line, corner to corner.

   Since v1.21.10 that is *interpolation*, and it is the third thing tried. Until v1.21.7 an edge was one cubic with two hidden controls, both heard along its entire length: a pull a quarter along moved the middle by nine tenths of itself and the far end by a third, so correcting one half spoiled the other, and settling a page went round in circles. v1.21.7 to v1.21.9 made each pull a local *bump added to a straight line*, which cured the circling but bought a new fault, and it is the one in the screenshot that ended it: between two bumps the line came back towards straight before rising again, so half an edge read as a hump, a dip, and another hump, with a handle sitting in the dip. A line drawn *through* the three has neither fault. Measured on the app's own drawing, the shape that came back with five changes of direction under v1.21.9 comes back with one — one rise and one fall, a single arc — and setting any handle moves the other two by 0.000 px.

   The line is a monotone cubic (Fritsch–Carlson), not the ordinary smooth spline, for one reason: between two handles it cannot leave the range those two set. An ordinary spline dips below the line before rising to a handle, which is the very wiggle this is here to remove. The price is worth naming: a handle left sitting on the line **holds** the line there, so pulling the middle one alone bows the middle half and leaves the outer quarters dead straight. Bowing a whole edge is three pulls, one to each handle — and each of the three lands exactly where the finger is and stays put when the others move.

   What has **not** changed is where the useful ground ends, and it is worth writing down because it invites the wrong fix. More controls per edge was never what limited how well a book page comes out. Going from one control to two cut the residual bow by about a third, and going beyond two changed nothing at all — ten controls an edge, forty-four handles on screen, left the text bowing as much as one did. What remains is the interior: the bend fills the inside of the shape by blending its edges, and a page rolling off a spine does not blend that way. The twenty-four are there to make the edge answer the finger where the finger is, not to fit the page more closely, and they do not fit it more closely. The bend is the crop's own memory the way the corners are — it survives a trip through `Custom` or `Normal`, and through `Apply`, and only `Reset` clears it. It costs nothing extra: the controls a column of pixels can hear never change from row to row, so they are worked out once for the whole image, and the mapping arithmetic for a 12-megapixel photo measured 74ms against the two controls' 90ms — cheaper than what it replaced, on top of a decode and an encode that dwarf both.

   `Custom` keeps its shape while `Normal` is in front — switching between the two says which crop applies, not that a shape placed by hand should be thrown away — and every photo remembers its own, so a batch can carry a different shape on each. Only `Reset` clears it. While `Custom` is in charge the ratio row dims — a shape with no right angles has no ratio to hold — and a magnifier follows the finger, because the finger covers the very corner it is trying to land on; a faint cross in the middle of its ring says which pixel exactly is under the fingertip. The cost is a heavier moment on `Apply`: about a second for a 12-megapixel photo, where the ordinary crop is nearly instant. Everything after the crop is untouched — to the size, quality, sharpness, target-size, transparency and PDF code alike, a straightened photo is an ordinary photo.
7. **Before/after compare viewer**: a drag slider comparing the original against the compressed result, showing dimensions and byte size for each. Changing sharpness here re-encodes that photo at its real output size, so the figures shown are the ones that will save.
8. **Sharing** via `navigator.share` (Web Share API) — opens the iOS share sheet so the user can save to Photos or Files.
9. **Press and hold a photo in the list**: it is magnified 2x, anchored under the finger and dragged 1:1 with it, and steps through compressed → original → compressed (three quarters of a second, then a second and a half), with a tag naming whichever is showing. Lifting the finger restores the card in one frame. The photos themselves are `pointer-events:none` so the press lands on `.shot` instead — an image under the touch is what makes iOS open its own full-screen preview over the app.
10. **PDF output**: a full-width `Save PDF` button beneath `Choose Photos` and `Save`, enabled with them. It wraps the results into one PDF, a page per photo at 150dpi, and opens the share sheet. The document follows the chosen format: a JPEG result is embedded byte for byte via `/DCTDecode`, so the page holds exactly the file shown on screen and nothing is compressed twice, and a PNG result goes in losslessly via `/FlateDecode` (raw pixels deflated through `CompressionStream`), which is far heavier — measured at about 4.7x on a photograph — and falls back to JPEG where `CompressionStream` is missing (iOS before 16.4). A WEBP result takes that JPEG path deliberately rather than the lossless one: no PDF reader knows the format, and deflating its pixels would make the document some six times heavier than the very files WEBP was chosen to keep small. The writer (`pdfOutBuild`) is ours — no library — and is not part of the isolation contract below.
11. **PDF input**: the picker also accepts PDF files. Each page is rendered to an image and enters the list as its own photo card, so a five-page document becomes five photos, each with its own crop, sharpness and size. It works on any PDF, not only scans — a page of text or a signature is rendered exactly as it appears. Capped at 30 pages per file, 2200px on the longest side. All of it lives in the fenced block governed by the isolation contract below.
12. **File naming**: every saved file is `<source name>_FW_<yymmdd>_<nn>` with a lowercase extension — the name it came in with, the app's mark, today's date, and a copy number starting at `01`. Spaces become underscores and characters a filesystem refuses become underscores too, runs of them collapse, and Arabic (or any other) letters are left alone. A PDF page carries `_SHEETnn` before the mark; the document from `Save PDF` takes the same name without the page number. Each card shows the source name and the saved name beneath it. The copy number is spent when a file reaches the share sheet, not when it is picked: re-encoding at another size or quality costs nothing, but saving the same photo twice gives the second one its own number, however it was compressed in between. Dismissing the share sheet hands the number back. The card shows what the next save will produce. The counter lives in `localStorage` under `fw-seq`, keyed by the day, so it carries across a reopen and is dropped when the date turns over. A `Copy No.` row beneath the three buttons — `Advanced` only, along with the two names on each card — corrects it by hand, which is needed because iOS never says where a file was saved: copies sent to Photos spend their numbers invisibly and leave gaps in the Files folder. The two buttons **shift** every loaded photo by one step rather than forcing them all onto the same number, so photos sitting on different numbers keep the gaps between them; a press is refused whole when any one photo would pass 01 or 99. Every card name repaints as it moves. Note that only **Save to Files** keeps the name — iOS renames anything saved to Photos, and no web app can prevent that.
13. **Transparency**: a **Background** row beneath `Format` with three choices — transparent, white, black. PNG and WEBP can both carry it out of the app (`alphaFmt()` is the single place that says so), and WEBP is much the lighter of the two — a cut-out that costs 9 KB as a PNG costs 4 KB as a WEBP with the same hole in it. It only appears once a picked photo really carries transparency: the app looks at a thumbnail of every PNG, WEBP or GIF as it decodes it, and a camera roll of JPEGs never grows the row at all. `Transparent` is switched off while the output is JPEG, which cannot hold transparency, and comes back on its own under PNG or WEBP — the choice itself is kept as the user left it, so a trip through JPEG does not spend it. Transparent is the default where it is possible, white otherwise. A result that kept its transparency is shown over a chequerboard, on the card and in the compare viewer, so an empty background reads as empty rather than as a white one. `Save PDF` always flattens onto white: a page with a hole in it prints unpredictably.
14. **HEIC input**: the picker accepts `.heic` and `.heif` instead of greying them out, so a photo that arrived from the Files app or a message compresses like any other. There is no library and no decoder of ours — the browser does the decoding, and a current iPhone does it. Where a browser cannot, the photo shows a red card naming HEIC as the reason (`errHeic`) instead of the generic one, and the other photos carry on. Note the trade this makes: with the picker declaring HEIC, iOS may hand over the original file rather than the JPEG it used to transcode for us — better quality, but it does put the decoding on Safari.
15. **Language**: a two-part toggle beneath the app name switches the whole interface between English and Arabic, and the choice is kept in `localStorage` under `fw-lang` so the app reopens in it. Every visible string lives in the `STR` object and is written into the `data-t` / `data-tp` / `data-ta` marks in the markup by `applyLang()`; a switch touches text only and never re-runs the pipeline, so results already on screen keep their exact bytes. `setStatus()` therefore stores a key rather than finished text, and `paintStatus()` / `paintSave()` repaint whatever is showing. Arabic letters join up, so `body.ar` lifts the monospace face and the letter-spacing from the labels and gives the running text its own `direction:rtl`; the layout itself is not mirrored.
16. **Target size**: a `Target Size` field beneath `Quality`, in `Advanced` only — folded away in `Simple` it also stops applying, and `fitOn()` is the one place that says so. A number of KB in it and every photo comes out under that size; an empty field is off and the app behaves exactly as it always did. It adds no row of buttons of its own — it presses the ones already there. While a target is in force the `Longest Side` and `Quality` rows dim, their labels read `— Chosen`, and the step each photo landed on is shown pressed; each card carries its own figures (`2400×1800 → 900×675 · Q75`) because photos in one batch can land differently and the rows can only show where most of them ended up. Tapping either row, or clearing the field, hands both rows back and drops the target. The order it spends things in is the agreed one: quality first, never below `Med` — that is where JPEG stops looking soft and starts looking blocky — and only then the longest side, a rung at a time, with `Low` and `Least` held back as the last resort under 350px. Two promises: a file never comes out over the size asked for, and a target nothing can reach says so on the card in red (`Smallest it can go`) rather than quietly handing back something bigger. A photo already under the target is left alone rather than inflated to fill it. PNG has no quality knob, so there it searches the size alone.
17. **Offline**: on the phone the app used to be fetched from the network every time it was opened, so with no bars it did not open at all. `sw.js`, beside `index.html`, keeps a copy of the page and hands it over when the network cannot be reached. It asks the network **first**, every time, and reaches the copy only when that fails — that order is the whole design and must never be turned around: the ordinary arrangement answers from the store without asking, which is faster and which would freeze the app on whatever it saw first, make the `Update` button meaningless, and make every change unverifiable on the phone. The PDF library is not fetched in advance; it is kept only if it was already fetched, so a user who never opens a PDF still never pays the megabyte. See **The publishing wrapper** below for what may and may not live in that file.
18. **Two modes**: a `Simple` / `Advanced` toggle in the top-right corner of the header, beneath the `Update` button and on exactly the same line as the language toggle opposite it. It is a fold, not a second app — one screen, one pipeline, the same settings underneath — and the choice is kept in `localStorage` under `fw-mode`. The app opens on `Simple`.

    `Simple` shows `Format` and a `Size` row of four, and nothing else: `Best` (the photo's own size, quality 90, no sharpening), `Medium` (900px, 60, sharpness 20%), `Small` (700px, 45, 30%) and `Tiny` (350px, 30, 40%). `Best` gets no sharpening on purpose — sharpening is there to give back what a downscale takes, there is none there to give anything back from, and it would otherwise run the unsharp mask over a full twelve-megapixel frame on every photo of every batch for a difference nobody can see.

    Folded away in `Simple`: `Target Size`, `Sharpness`, the two file names on each card, the `Copy No.` row, the `Background` row, and the compare viewer's own sharpness slider. **What is folded also stops applying**, and that is the whole of the contract: a target size typed in `Advanced` must never go on quietly overruling the preset the user has just pressed, and neither must a sharpness set on one photo in the viewer. `fitOn()` and `effSharp()` are the two places that say so. Every value is kept, and comes back into force with the row it belongs to.

    A preset grows no settings of its own — it presses the very rows it hides, exactly as a target size does, so `Advanced` opens showing precisely what `Simple` had been doing. Coming back into `Simple` re-applies the pressed preset, because the row is the only thing the user has to go on and it must not show `Best` while the photo runs at whatever `Advanced` was left on.

    The palette follows the mode. `Simple` is cream paper with dark olive ink; `Advanced` is dark maroon falling into black with cream ink; a gold band carrying the app's mark runs under the header in both. Both papers are drawn rather than photographed — the wash is a gradient and the tooth is a noise field `grainMake()` draws onto a canvas at startup and hands to `--grain`, so there is still no image file and nothing fetched. It must not go back into the stylesheet as an SVG filter, which is where v1.22 put it: **Safari will not run an SVG filter inside a background image**, and it fails silently, so the phone got a flat background where a textured one was intended. Two scales, the way paper has two — a slow wide mottle with fine grain over it, the dark side twice the light one, and a tile that repeats with no seam. Cream shows grain far more than maroon does and takes about half the strength. Both layers are fixed to the screen, so they are rasterised once and a canvas the size of the whole document is never made. In `Advanced` a pressed button is filled with gold rather than a darker black, and a warning is gold rather than red: on the black half of the page a dark fill against a dark rest is a difference nobody can see, and red is invisible on maroon. That gold is a gradient, not one flat colour — flat, it reads as yellow paint — and the frames around the buttons are gold too and half a pixel heavier, because on a dark page a hairline all but disappears (`--bw`). The compare viewer and the cropper stay dark in both modes, since judging a photo wants a neutral ground, but they take their darkness from the palette (`--stage` and its three companions): warm black under `Advanced`, dark olive-brown under `Simple`. They used to be a blue-black, which read as another app's colour beside the maroon. Everything drawn **over** the photo — the crop frame, the grips, the `ORIGINAL` and `COMPRESSED` tags — stays white, because its job is to be seen on any photo whatever. `themePaint()` hands the palette's top colour to the root element and to the `theme-color` tag, neither of which can see a variable set on the body.
19. **Home-screen icon**: the author's own design — a feather over a shield, the shield standing for the promise the app is built on — written into the `<head>` as data rather than added beside the file. It is flattened onto an opaque square with no rounded corners and no shadow of its own, because iOS masks the corners itself and would otherwise round an already-rounded card and frame it in grey; any future icon must be prepared the same way. It costs 32 KB, which is what soft gradients cost in PNG. Without it iOS invents a grey letter tile, which left several shortcuts to different versions looking identical. iOS takes the icon **once**, at the moment `Add to Home Screen` is tapped, and never asks again — a shortcut already on a home screen keeps its old tile no matter what the file says, and only a freshly added one picks up a change.

### Processing pipeline

Before any of it, `acceptFiles()` receives whatever the picker handed over; PDF pages have already become ordinary image files by then (see the isolation contract), so the pipeline itself only ever sees images.

`decode()` (`createImageBitmap`, falling back to `<img>`) → `cropAndOrient()` (applies crop + rotation + flip with exact coordinate-space transforms) → `stepDown()` (progressive halving rather than a single downscale, to avoid aliasing) → `sharpen()` (a simple unsharp mask via hand-rolled convolution over `ImageData`, skipped entirely at 0) → `toBlob()` for final encoding.

**Metadata.** Nothing but pixels leaves the app. Decoding hands over an image, the pipeline draws it onto a canvas, and `toBlob()` writes the file out of that canvas — so GPS coordinates, camera and lens, capture date and time, and any copyright field the source carried are absent from every result, without a line of stripping code. Every photo takes that road, `Source` format included; no file is ever passed through untouched. The only exception is the ICC profile, which is not EXIF and is written by the browser under the colour-space section below.

**One tag is read, and none is written.** Since v1.19.1 the app reads the focal length out of the picked file — EXIF tag `0xA405`, the focal length as a 35mm camera would state it — because a `Custom` crop cannot work out the proportions of a page seen at an angle without it. It is one number, it is read on the phone, it is used to size the output, and it is never written into anything: the promise above is about what leaves, and nothing about what leaves has changed. The app was already reading the file's bytes for the same kind of reason — `iccOf()` sniffs the colour profile out of them — so this is the same road, not a new one.

EXIF `Orientation` is the one thing that survives, and it survives as pixels rather than as a tag: the browser applies it before `decode()` returns, and the tag dies with the rest of the metadata. `decode()` and `viaImage()` therefore ask for `imageOrientation: "from-image"` by name instead of trusting the default — the default is what shifted under us in older browsers, and a photo whose tag were dropped without first being applied would save on its side with nothing left to correct it. `decode()` falls back to a plain `createImageBitmap` where the option is refused, and then to `viaImage()`.

**Colour space.** Every canvas in the pipeline is born in `canvasOf()`, and it takes its space from the source rather than assuming sRGB. `cmSpace()` sniffs the picked file's ICC profile, and if its red primary sits beyond sRGB's — Display P3, which is what an iPhone camera writes, or anything wider — the whole chain runs in `display-p3` and the saved file is tagged to match. A HEIC states its space in a box the sniffer cannot read, so the format itself is taken as the answer and it runs wide by default — without that a HEIC would be clipped to sRGB, which is the exact fade v1.12.3 removed. An embedded profile, where there is one, still overrules the assumption. Otherwise nothing changes: screenshots, downloads and rendered PDF pages keep the old sRGB path exactly. Without this, drawing a P3 photo onto an sRGB canvas clipped every colour the narrower space could not hold, and a pure red was saved as `233,51,35` instead of `255,0,0` — which reads on the phone as if the compression ate the colour.

Widening is gated on `cmProbe()`, a one-off runtime check that the browser really hands back a P3 context **and** really tags what it encodes. If either is missing, nothing widens and the app behaves exactly as it did before. `pdfOutBuild()` states the space as well: a page that came out wide is written with an `/ICCBased` colour space instead of `/DeviceRGB`, because a reader would otherwise take it for sRGB and flatten precisely what the pipeline just preserved.

**Transparency.** `canvasOf()` also takes the colour painted underneath, and every stage passes it down alongside the space: `null` asks for a canvas that keeps the transparency, and anything else is a matte filled before the photo is drawn. Nothing widens to an alpha canvas unless the photo actually has transparency — an opaque PNG encoded with an alpha channel it does not need comes out about a fifth heavier, so `matteOf()` asks `alphaSniff()` first, and a photo with no transparency takes the old white path and saves byte for byte what it always did.

Sharpening a cut-out needs its own path, `sharpenAlpha()`: a neighbour that is not there has no colour of its own, so the colours are weighted by their alpha before the convolution and the weight is taken back out after — without that, every edge of a logo is dragged towards black. Alpha is sharpened alongside the colours so the edge stays as crisp as they are. The plain `sharpen()` is untouched and still runs for everything else.

A free tilt cannot be expressed as a source rectangle, so `cropAndOrient()` branches to `cropTilted()`, which replays the whole transform at source resolution and lifts the crop out of it. Edits with no tilt keep the original source-rect path, so that path must stay intact.

**The four-point crop.** A perspective correction cannot be expressed as any affine transform at all, so `cropAndOrient()` branches earlier still, to `cropQuad()`. Canvas cannot draw one either — `drawImage` only ever shifts, scales and rotates, whatever matrix it is handed — so the mapping is written out and walked one output pixel at a time, reading the source between its own pixels: the same kind of hand-rolled pass as `sharpen()`, and not to be replaced by a library or a CSS trick. `qMap()` puts the unit square straight onto the four points, which are already in the photo's own pixels, and that is the whole matrix every output pixel is stepped through with bilinear sampling. The rotation, the flips and the tilt are deliberately **not** undone here and must never be added back: they were only the view the points were placed through, and the points came out of it already in the photo's own terms. The corner ordering carries the rest — a photo placed on through a mirrored view yields a quadrilateral wound the other way, and the same mapping mirrors the result, which is exactly what the flip asked for. Only the corner of the photo the four points enclose is read into memory — a straight line stays straight under the mapping, so the four corners bound the whole of it. Alpha is weighted the way `sharpenAlpha()` weights it, or every edge of a cut-out would be dragged towards black; where all four neighbours are opaque, which is nearly always, the plain path runs instead.

**The bend.** `Curve` adds a displacement inside the unit square, `qBend()`, applied **before** the perspective and never instead of it. That order is the whole design and must not be turned around. The obvious construction — filling a shape bounded by four curves directly, a Coons patch on the boundary — spreads the inside evenly and throws away the foreshortening the perspective has just worked out: the far edge of the page would be walked at the same rate as the near one. Applied first, the bend leaves the perspective to do its own job afterwards, and every control at rest gives the square back untouched, so a straight-edged crop is arithmetically the crop it was before any of this existed — the same file, byte for byte. Each edge is drawn as a uniform cubic B-spline over thirty controls (`BEND_N`) along the twenty-seven spans (`BEND_K`) that cross it, one control to each end of every span and one past each corner. It used to be twenty-four, knotted so that the first and the last sat two knots inside the corners; that made every control silent at the corners, which pinned them for free and cost a fourteenth of the edge at each end, where nothing could be heard and so nothing could bend. The row reaches the corners now and they are pinned by the solve instead: the three controls heard at a corner are found together with the rest under the condition that what they say there adds to nothing, which holds to a few parts in a billion billion of the square — and `bendZero()` and `bendBack()`, the only other two hands that ever write a bend, one zeroing it and one scaling it whole, cannot break a condition of that shape. The controls are not set by hand and never were: since v1.21.10 they are *solved* for. `bendSet()` is the one place a bend is set, and it works in two steps. First it lays down the line the edge should follow: a monotone cubic (`bendTans()` and `bendLine()`, Fritsch–Carlson) through five points — the two corners at zero and the three handles at their own places, `bendVal()` reading back whatever the two the finger is not on are worth now. Then it solves the tridiagonal system that makes the drawn curve match that line at every knot, the two corners included — matching it there, where the line is nothing by construction, is exactly what pins them — and the two rows at the ends carry one thing more, the slope the line leaves its corner at, which is what makes the curve leave with it instead of leaving flat. It repeats twice more, each round nudging the line by whatever the drawn curve actually gave at the three handle positions — which sit between knots, where matching at the knots leaves a hair. Three rounds land a handle under the finger to within a billionth of the square. Before v1.21.7 an edge was one cubic with two controls; from then to v1.21.9 a pull added a local bump to a straight line, which left the hump-and-dip a line through the points cannot have. `bendSet()` writes only the number that runs **across** the edge, and that is not a detail. The other half slides the points of the curve about on a path whose shape has not changed, so nothing moves on screen — but it silently redefines which part of the page each column of the output is read from. Taking it was the app letting the finger say where the middle of an edge is, when the middle is the four corners' to say; measured against a simulated camera on a page ruled both ways and curled the way a book page curls, a line that should have run straight down came back bowed 2.2mm across a 210mm page, and a line that should have run straight across bowed 5.3mm where a flat crop of the same photo had it perfectly straight. Dropped, both read 0.0mm. `bAt()` gives the four controls a point can hear and how loudly, written into an array the caller keeps rather than returned, because the pixel loop asks millions of times; `bDt()` is the same four differentiated, for the fold test. `bendNear()` finds which edge the finger is on by walking the boundary, because a curve under a perspective has no tidy nearest point to solve for. `bendDrag()` serves all three handles, and its `j` argument is the whole difference between them: 1 for the big one and 0 or 2 for the smaller ones either side. All three first take their place along the edge from the finger's own place along it — the big one too, since v1.21.11. Which coordinate runs along an edge is simply which edge it is — the unit square's top and bottom run along u, its sides along v, and an edge's own line sits at 0 for the top and the left and at 1 for the right and the bottom — and `spotPut()` is the one place a handle's place along its edge is written: it holds it a tenth of the edge clear of the corner behind and of the next handle along, and moves whichever handles stand in its way ahead of it rather than refusing the move. A handle pushed that way is read back off the curve where it now stands, so making room never bends anything. That along-edge reading is not a way back in for the half that is deliberately dropped: it moves the handle and never the bend. The other two handles are simply read and handed back unchanged, which is what makes a drag say only where its own handle goes. `qBendOK()` samples the determinant of the map's Jacobian across the square and refuses a bend that would fold it, because a folded map has no straightening in it — the same objection a crossed-over quadrilateral gets, and a handle slides against that limit rather than sticking. The limit is far past anything a page asks for: folding does not begin until a pull of about a whole unit, and a page needs about a fifth. A row of controls can put a fold in a smaller place than two ever could, so that square is walked more finely than it was, and so is every other walk along an edge — `qSizeBend()`, `qBendIn()` and `cropQuad()`'s bounding walk take 192 steps, the outline 48. Under-walking is not a cosmetic matter: a bulge whose tip the walk steps over is a bulge read from outside the photo, which comes back as the last row of pixels smeared across the page. `qBendIn()` allows one pixel of slack, and must: the line an edge is drawn along and the curve that draws it are not the same kind of curve, so matching the one at every knot leaves the other ringing by about a thousandth of the bend — a tenth of a pixel on a 1200-pixel photo. Judged at exactly zero that tenth of a pixel refused every bend of an edge lying on the photo's own border, which is every bend of an uncropped photo. What the test is for is a bulge that reads a band from outside the photo, and a pixel is not that. `qSizeBend()` walks the four boundary curves rather than measuring across them, since a bent edge is longer than the line between its ends, and `cropQuad()` reads a region of the source that covers the bulge rather than just the corners.

**The corner.** `Custom` has a displacement of its own, `qKink()`, built the same way as the bend and applied at the same moment — before the perspective, every control at rest giving the square back untouched. It is the bend's opposite: where the bend puts a smooth cubic on each edge, this puts a tent on it, so the edge runs straight to a corner in its middle and straight on to the far end. One control to an edge, because one corner is one corner, and the displacement at the middle of an edge simply *is* that control, so the handle lands exactly where the finger is — including along the edge, which for a corner moves the corner and must be kept, and is the one place it differs from a bend. It is for a page that is *folded* rather than curled — two flat halves meeting on a hard line, which no curve has in it — and for anything whose outline is not a rectangle at all.

The two travel as one value and its length says which: eight numbers is corners, anything longer is a bend (two hundred and forty, as the controls stand), nothing at all is the plain straight-edged crop. That is what lets `qSizeBend()`, `qAspectBend()`, `qBendIn()`, the editor's outline and the whole of `cropQuad()` serve both without any of them learning that there are two. `qKinkOK()` refuses a fold the way `qBendOK()` does, by the determinant of the Jacobian, sampled between the kink lines rather than across them since a tent has no derivative at its peak. Each shape keeps its own while the other is in front — a trip through `Curve` and back finds the corners where they were left — and only `Reset` clears either.

**One description of the view.** `qFwd()` says where a source pixel lands in the upright view, and the editor paints its preview with it rather than keeping its own copy of the same chain; `qInv()` is the way back, and it is what turns a finger on the glass into a point on the photo. That sharing is deliberate and must stay so: if the two drifted, the crop would land somewhere other than where the four points were put, and the photo the user framed is not the photo that would be saved.

**The window and the photo.** `viewK` is the one number saying how large the photo is being shown, and the zoom lives inside it: `fitK` is the size the photo is fitted at, `zoomK` is what the fingers have done to it, and `viewK` is the two multiplied. Everything downstream already spoke in `viewK` — the size shown under the photo, a finger's travel turned into travel across the photo, the crop that is finally lifted — so none of it had to learn that a zoom exists. The box beneath the photo is a window rather than the photo itself: `drawView()` paints a canvas the size of the window whatever the zoom, so a photo magnified ten times costs no more memory than one that is not, and a canvas the size of the magnified photo — hundreds of megabytes on a phone — is never made. What is drawn over the photo travels with it on `#cropPan` and is cut off a little way outside the window, so a handle sitting on the photo's own corner is still drawn whole; that slack is given only on a side where the photo really ends, since on a side it carries on past the window the same slack leaves a stub of the outline hanging over the black. The window and the photo inside it are the same rectangle at zoom 1 and neither is rounded, because a rounding between them would leave a hair of white along an edge — and did, until v1.21, report a crop pushed against the bottom edge of a 900-pixel photo as 902 and record it as an edit rather than as the whole photo.

**Always state the size a photo is drawn at.** Every `drawImage` in the file passes explicit width and height, and none may ever be shortened to the three-argument form. A photo carrying an orientation tag can be handed to the canvas with its sides the other way round to the ones `dimsOf()` measured, and the short form believes the browser rather than the measurement — which lands the photo in a corner of its own frame at the wrong size, intermittently, on exactly the large iPhone photos that matter most. v1.18 fixed that in the editor's preview and its magnifier; the pipeline had always stated its sizes.

**Target size.** `prepSrc()` holds the first half of that road — decode, crop, and the untouched copy the compare viewer needs — so a photo can be encoded many times without being decoded again; `process()` calls it and is otherwise unchanged, byte for byte. `fitProcess()` is the search: it walks the rungs `fitPlan()` gives it, encodes once at the floor quality to see whether a rung can hold the file at all, and only climbs the quality back up on a rung that can. A rung that misses says roughly how much narrower the photo has to be — bytes follow the pixel count, so the square root of the overshoot is the scale — and the rungs in between are skipped, which is what keeps a photo at six to nine encodes instead of twenty. `fitPaint()` presses the result onto the two rows afterwards.

Each image is processed independently and asynchronously, guarded by a `token` counter that cancels stale work when the user changes settings mid-run (race-condition guard). `results` is keyed by photo index rather than pushed, because the viewer re-encodes a single photo in place; `sharpToken` guards that path the same way.

## Structure and development

- **No build step, no package manager, no external dependencies.** `index.html` holds everything: HTML + CSS (in `<style>`) + JS (a single `"use strict"` IIFE in one `<script>`). `sw.js` sits beside it and holds no app code at all — see **The publishing wrapper** below.
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

**The number is confirmed with the user before it ships.** The table above decides most cases on its own. But the awkward ones — a repair that changes behaviour, a correction to a version that has only just shipped, a batch that mixes a fix with a cosmetic tweak — are exactly the ones where a wrong number is easy to justify to oneself and wrong to the user. So before any commit that carries a version, say three things and wait for the answer:

1. **The version the app is on right now** — the last number reached before this change.
2. **The number this change would make it.**
3. **Why that is the right step**, by the table above.

Naming the current one is what makes the step checkable: nobody can judge a jump without seeing where it started from. And a number already committed is never rewritten, because history here is added to and never re-authored — so a wrong one costs a second commit and a second deploy, and asking first is cheaper than both.

**Where it is displayed:** the version appears inside the app itself — **top-right, above the `Update` button** — in the `<span class="ver">` inside `.meta-right` in `index.html`. Any bump must be applied there as part of the same change. (It sat beneath the words `On-Device` until v1.22, which removed them: the promise they abbreviated is written out in full at the foot of the screen.)

The current version in `index.html` is **`v1.22.1`**.

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
3. **Do not introduce build tools or bundlers** (webpack, vite, etc.) or split the code across multiple files unless explicitly asked — the simplicity of one copyable, directly-openable file is a deliberate feature. The one file allowed beside it is the publishing wrapper, under the rules in **The publishing wrapper** — and it is not an exception to this one, because it carries no app code.
4. **Preserve iOS/PWA compatibility**: any change to `<head>` or to the meta tags (`viewport`, `apple-mobile-web-app-*`, `theme-color`, `color-scheme`) must stay compatible with current iOS Safari behaviour, and the `env(safe-area-inset-*)` handling must not be removed.
5. **Preserve the `token` counter logic** in async operations (`showOriginals`, `run`, and so on) whenever touching the processing pipeline — it is what prevents stale results from racing in when the user changes settings mid-processing.
6. **Do not simplify or replace the hand-written algorithms** (`stepDown` progressive downscaling, `sharpen` unsharp mask, `cropTilted` tilt transform) with external libraries or browser alternatives (such as the `image-rendering` CSS property) without an explicit request — these are deliberate choices that preserve image quality without dependencies.
7. **Always free memory**: every `ImageBitmap`, `<canvas>`, and Object URL created must be released via `release()` / `kill()` / `URL.revokeObjectURL()` on the correct path, including error paths, to avoid leaking memory on mobile — images can be very large.
8. **Do not change the developer byline** (`Malek Barbari` in `.byline` and `footer`) unless explicitly asked. The **version number, by contrast, must be updated** with every functional or cosmetic change, following the Versioning section above — never leave a change without the appropriate bump.
9. **Match the existing code style** (ES5-ish, no frameworks, the same terse variable naming already used in the file) rather than rewriting it in a modern idiom, to keep the file coherent and diffs small.
10. **Never break the PDF isolation contract** — see the section of that name below. PDF-reading code stays inside its fenced block, behind its kill switch, and out of every other function in the file.
11. **Any UI change (colours, fonts, layout) must preserve the current visual character** — the two palettes described under **Two modes** below, cream and dark olive for `Simple` and dark maroon into black for `Advanced`, tied together by the gold band — unless a new design is explicitly requested. Every colour the main screen draws with is named in one of three blocks at the top of the `<style>`: the shared one on `:root`, and one each on `body.simple` and `body:not(.simple)`. A colour written as a hex anywhere else in the main screen is a bug, with three deliberate exceptions, each carrying its own comment: the chequerboard behind a transparent photo, the white of the tag and the edit icon that sit over the photo itself (and the white of what the cropper draws over it), and the gold inside the `--star` data URI, since a data URI cannot read a variable. A fourth is the root element, which cannot see a variable set on the body and so carries the `Simple` paper written out until `themePaint()` hands it the palette's own top colour a moment later. The paper/receipt palette this replaced — `--paper` in blue-grey with a red `--stamp` — ran from v0.0 to v1.21.13 and is retrievable from the log like anything else.
12. **Never let app logic into the publishing wrapper** — see the section of that name below. `sw.js` is a delivery detail, not part of the app, and `index.html` must stay able to run with it deleted.

## The publishing wrapper

`index.html` is the app. `sw.js` is not — it is how the app is *delivered* to a phone, and it exists for exactly one reason: without it the app cannot open with no signal, because a service worker is only ever registered from a real file path. A script written inside the page cannot become one; wrapping it in a Blob URL does not work either, because a worker's scope is computed from where its file actually sits and a Blob has nowhere. That is a structural fact of the browser, not a gap to be worked around.

**The rule the user agreed to, in his words:** the constraint is not "one file" any more, it is **"one independent file, plus an optional publishing wrapper"**. What makes that honest is the independence, and it is testable: delete `sw.js` and the app is unchanged except that it stops opening without a signal.

### What may live in the wrapper

Caching, and nothing else. No compression, no cropping, no naming, no encoding, no image code of any kind. It must never see a photo. If a change would put app behaviour into `sw.js`, the change is wrong — the behaviour belongs in `index.html`, where the user's promise that nothing leaves the phone is enforced and auditable in one place.

It also names nothing belonging to the app. It caches whatever goes past it and keeps no list, so the app can grow without the wrapper ever being edited — and so the PDF removal recipe stays exactly three steps, with nothing in `sw.js` to clean up.

### The three properties that must survive every future change

1. **The network is asked first, always.** Not cache-first, not stale-while-revalidate. The user verifies every change by opening the live site on his phone and taking a screenshot; anything that can serve him yesterday's app makes that impossible and is forbidden, however much faster it is.
2. **`index.html` still runs alone.** Opened straight off a disk it must work in full, with no wrapper and no server. The browser withholds `serviceWorker` outside a real https address, so the registration block is skipped there on its own.
3. **Removal stays two deletions.** Delete `sw.js`, delete the block marked `OFFLINE` in `index.html`, done — nothing to put back, because nothing in the app was altered to accommodate it. `sw.js` also carries `SW_ON` at its top: setting it to `false` makes the worker an inert corridor and clears what it stored, which is the way to disarm a copy already sitting on a phone that cannot be reached. It deliberately does **not** unregister itself — the page registers the worker on every load, so a self-deleting worker is simply put back, and the two spend the day undoing each other.

### If the wrapper ever grows a second file

It may — a manifest, an icon file, a redirect. Each one is subject to all of the above, and each must be listed here when it is added. **A file that fails property 2 is not a wrapper file, it is the app being split, and the answer to it is no.**

## PDF: the isolation contract

Reading PDF files is the only part of FEATHER that leans on code we did not write — the `pdf.js` library, vendored inside the repository. The user accepted it on one condition, agreed in full before a single line was written: **it must stay removable at any point in the future, in minutes, with no thinking required, no matter how many versions have been built on top of it.**

`git revert` is explicitly **not** the removal plan. By the time removal is wanted, dozens of features will sit above that commit and a revert would collide with all of them — the user said so himself, and he is right. History is not the guarantee; **construction is**. What follows is that construction. These are binding rules, not style preferences.

**Status:** implemented in v1.9, under a contract written and agreed first.
**Recipe last verified against:** v1.14. Re-verify and update this line every time the block is touched.
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

- **The picker's `accept`.** The block never edits the markup's `accept`, ever — whatever the app has put there is the app's own business (it reads `image/*,.heic,.heif` since v1.14). When it runs, the block widens the attribute itself, at runtime, to also accept PDF. Delete the block and the picker is back to whatever the markup says, with nothing to restore.
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

- The `accept` attribute on the picker. The block never touched it, and it must stay exactly as the markup has it.
- `acceptFiles`, and `sourceFiles`, and everything that reads them.
- `fwClean` and the rest of the naming helpers (`fwStamp`, `fwPad`, `fwSeq`, `fwReserve`, `outName`). The block calls `fwClean` to name its pages, but they are the app's own and every photo goes through them.
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
