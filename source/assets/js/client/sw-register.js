// Register the service worker when supported by the browser.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(function () {
    // Registration failed — no action needed; site works without SW.
  });
}
