/* FEATHER — the offline helper.

   This file is not the app. index.html is the whole app and always was, and it
   still runs on its own from a plain double-click with nothing beside it. This
   is publishing wrapper: it holds no compression, no cropping, no naming, no
   image code of any kind, and it never sees a photo. Delete it — and the small
   block in index.html marked "OFFLINE" — and the app is exactly what it was,
   minus the one thing this buys: it opens with no signal.

   It asks the network FIRST, every single time, and only reaches for the cache
   when the network cannot be reached at all. That order is deliberate and must
   not be turned around. The usual worker answers from its cache and never asks,
   which is fast and which also means a new version can never arrive — the app
   would freeze on whatever it saw first, the Update button would stop meaning
   anything, and a change pushed to GitHub would never show up on the phone.
   Asking first costs a round trip that the browser's own cache mostly absorbs,
   and it keeps the app updating exactly the way it did before this file existed.

   Nothing is listed here by name except the page itself. Whatever else the app
   fetches is kept as it goes past, so this file never has to know what the app
   is made of and never needs editing when the app grows.
*/

/* false turns this worker into an empty corridor on every phone that loads the
   page: it clears what it stored and stops answering anything, so every request
   goes straight to the network exactly as it did before this file existed. It is
   the way out if this file ever misbehaves in a hand we cannot reach — flip it,
   commit, and the next visit or two picks it up.

   It is deliberately not written to unregister itself. The page registers the
   worker on every load, so a worker that deletes itself is immediately put back,
   and the two spend the day undoing each other. An inert one is the honest and
   the predictable off. To make it vanish altogether, delete the file: a browser
   drops a worker whose file has stopped existing, and that is the real removal
   the recipe at the top describes. */
var SW_ON = true;

/* bump this and the previous store is dropped on the next visit */
var CACHE = "fw-1";

/* the app's own address, with any ?u= the Update button appended stripped off,
   so every visit reads and writes one entry instead of leaving a new one behind
   on every press */
var PAGE = new URL("./", self.location).href;

self.addEventListener("install", function (e) {
  if (!SW_ON) { self.skipWaiting(); return; }
  /* take a copy at install so the app survives a signal lost right after the
     very first visit, rather than only from the second one onward; "reload"
     asks the network for it instead of accepting a copy already in hand */
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.add(new Request(PAGE, { cache: "reload" }));
    }).catch(function () {}).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (!SW_ON || k !== CACHE) return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (e) {
  if (!SW_ON) return;

  var req = e.request;
  if (req.method !== "GET") return;
  try {
    if (new URL(req.url).origin !== self.location.origin) return;
  } catch (err) { return; }

  /* a page request is filed under the bare address; everything else under its
     own, which is what lets the PDF library answer offline once it has been
     fetched a first time — this file does not know what it is, only that the
     app asked for it */
  var key = req.mode === "navigate" ? PAGE : req;

  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) {
          return c.put(key, copy);
        }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(key, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        throw new Error("offline and not stored");
      });
    })
  );
});
