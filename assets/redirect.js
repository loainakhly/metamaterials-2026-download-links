import { STORE_URLS } from "./store-links.js";

const ALLOWED_DESTINATIONS = Object.freeze({
  ios: Object.freeze([
    Object.freeze({ protocol: "https:", hostname: "apps.apple.com" }),
    Object.freeze({ protocol: "itms-apps:", hostname: "itunes.apple.com" }),
  ]),
  android: Object.freeze([
    Object.freeze({ protocol: "https:", hostname: "play.google.com" }),
  ]),
});

/**
 * Return a safe store URL for the requested platform, or null when the
 * destination is blank, malformed, insecure, or points to the wrong host.
 */
export function getStoreDestination(platform, storeUrls = STORE_URLS) {
  const allowedDestinations = ALLOWED_DESTINATIONS[platform];
  const candidate = storeUrls?.[platform];

  if (!allowedDestinations || typeof candidate !== "string" || candidate.trim() === "") {
    return null;
  }

  try {
    const destination = new URL(candidate.trim());
    const hasAllowedDestination = allowedDestinations.some(
      (allowed) =>
        destination.protocol === allowed.protocol &&
        destination.hostname === allowed.hostname,
    );
    const isAllowed =
      hasAllowedDestination &&
      destination.username === "" &&
      destination.password === "" &&
      destination.port === "";

    return isAllowed ? destination.href : null;
  } catch {
    return null;
  }
}

/**
 * Redirect without leaving the coming-soon page in browser history.
 * Returns the selected destination to make the behavior easy to test.
 */
export function redirectToStore(platform, storeUrls, locationObject) {
  const destination = getStoreDestination(platform, storeUrls);

  if (destination) {
    locationObject.replace(destination);
  }

  return destination;
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  redirectToStore(document.documentElement.dataset.platform, STORE_URLS, window.location);
}
