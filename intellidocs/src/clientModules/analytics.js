/**
 * Sends a Google Analytics page_view when the reader moves to another page inside the site,
 * as the Docusaurus gtag plugin did. Analytics loads only on the live site (loadAnalytics in
 * docusaurus.config.js), so on other hosts window.gtag does not exist and this does nothing.
 */
export function onRouteDidUpdate({location, previousLocation}) {
  if (!previousLocation || typeof window.gtag !== 'function') return;
  if (
    location.pathname === previousLocation.pathname &&
    location.search === previousLocation.search &&
    location.hash === previousLocation.hash
  ) {
    return;
  }
  // The page title changes in the next tick, so send the new title, not the old one.
  setTimeout(() => {
    window.gtag('set', 'page_path', location.pathname + location.search + location.hash);
    window.gtag('event', 'page_view');
  });
}
