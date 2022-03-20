import ReactGA from "react-ga";

/* istanbul ignore next: if analytics fails, oh well */
export function initAnalytics(): void {
  // The GA key is stored in CI and local `.env` file. Since we're using the
  // transform-inline-environment-variables plugin, it should get swapped out
  // at build time.
  // @ts-ignore
  const gaTrackingId = process.env.GA_TRACKING_ID ?? null;
  if (!gaTrackingId) {
    return;
  }

  ReactGA.initialize(gaTrackingId, {
    // @ts-ignore
    debug: process.env.GA_DEBUG === "true",
    testMode: /localhost/gi.test(window.location.hostname),
    gaOptions: {
      siteSpeedSampleRate: 100,
    },
  });
}
