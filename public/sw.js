// Minimal service worker — exists only so the browser considers this
// site "installable" (Add to Home Screen / Install app). It does NOT
// cache anything, so the site always loads fresh content, the same
// as if there were no service worker at all.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Intentionally empty — just passes every request straight through
  // to the network. Required for installability, not for caching.
});
