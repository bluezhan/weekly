'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/* ===========================================================
 * docsify sw.js
 * ===========================================================
 * Licensed under Apache 2.0
 * Register service worker.
 * ========================================================== */

var self = window;
var RUNTIME = 'docsify';
var HOSTNAME_WHITELIST = [self.location.hostname, 'fonts.gstatic.com', 'fonts.googleapis.com', 'unpkg.com'];

// The Util Function to hack URLs of intercepted requests
var getFixedUrl = function getFixedUrl(req) {
  var now = Date.now();
  var url = new URL(req.url);

  // 1. fixed http URL
  // Just keep syncing with location.protocol
  // fetch(httpURL) belongs to active mixed content.
  // And fetch(httpRequest) is not supported yet.
  url.protocol = self.location.protocol;

  // 2. add query for caching-busting.
  // Github Pages served with Cache-Control: max-age=600
  // max-age on mutable content is error-prone, with SW life of bugs can even extend.
  // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
  // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
  if (url.hostname === self.location.hostname) {
    url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
  }
  return url.href;
};

/**
 *  @Lifecycle Activate
 *  New one activated when old isnt being used.
 *
 *  waitUntil(): activating ====> activated
 */
self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
}

/**
 *  @Functional Fetch
 *  All network requests are being intercepted here.
 *
 *  void respondWith(Promise<Response> r)
 */
);self.addEventListener('fetch', function (event) {
  // Skip some of cross-origin requests, like those for Google Analytics.
  if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
    // Stale-while-revalidate
    // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
    // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
    var cached = caches.match(event.request);
    var fixedUrl = getFixedUrl(event.request);
    var fetched = fetch(fixedUrl, { cache: 'no-store' });
    var fetchedCopy = fetched.then(function (resp) {
      return resp.clone();
    }

    // Call respondWith() with whatever we get first.
    // If the fetch fails (e.g disconnected), wait for the cache.
    // If there’s nothing in cache, wait for the fetch.
    // If neither yields a response, return offline pages.
    );event.respondWith(Promise.race([fetched.catch(function (_) {
      return cached;
    }), cached]).then(function (resp) {
      return resp || fetched;
    }).catch(function (_) {/* eat any errors */})

    // Update the cache with the version we fetched (only for ok status)
    );event.waitUntil(Promise.all([fetchedCopy, caches.open(RUNTIME)]).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          response = _ref2[0],
          cache = _ref2[1];

      return response.ok && cache.put(event.request, response);
    }).catch(function (_) {/* eat any errors */}));
  }
});