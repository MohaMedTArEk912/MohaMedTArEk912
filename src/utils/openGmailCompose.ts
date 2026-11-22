import type { MouseEvent } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

const RECIPIENT = PORTFOLIO_DATA.profile.emails[0];
const SUBJECT = 'Hello Mohamed — Portfolio Inquiry';
const BODY =
  'Hi Mohamed,\n\nI came across your portfolio and would love to connect with you about ';

export const GMAIL_WEB_COMPOSE_URL = PORTFOLIO_DATA.profile.gmailComposeUrl;

const ENCODED_SUBJECT = encodeURIComponent(SUBJECT);
const ENCODED_BODY = encodeURIComponent(BODY);

const IOS_GMAIL_COMPOSE_URL =
  `googlegmail:///co?to=${encodeURIComponent(RECIPIENT)}&subject=${ENCODED_SUBJECT}&body=${ENCODED_BODY}`;

const MAILTO_COMPOSE_URL =
  `mailto:${RECIPIENT}?subject=${ENCODED_SUBJECT}&body=${ENCODED_BODY}`;

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Opens the native Gmail / mail app directly into a pre-filled Compose screen on phones:
 * - iOS: launches the native Gmail app via `googlegmail:///co?...`, falling back to `mailto:`
 *   only if the Gmail app is not installed.
 * - Android: launches `mailto:` directly, which opens the native Gmail app Compose screen
 *   across all Android browsers and in-app WebViews (WhatsApp, LinkedIn, Brave, Chrome).
 * - Desktop: leaves the standard Gmail Web Compose `href` in a new tab untouched.
 */
export function handleGmailComposeClick(event: MouseEvent<HTMLAnchorElement>): void {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  if (isIOSDevice()) {
    event.preventDefault();
    const startedAt = Date.now();
    let appOpened = false;

    const cleanup = () => {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onAppSwitch);
      window.removeEventListener('blur', onAppSwitch);
    };

    const onAppSwitch = () => {
      appOpened = true;
      cleanup();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        onAppSwitch();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onAppSwitch, { once: true });
    window.addEventListener('blur', onAppSwitch, { once: true });

    const fallbackTimer = window.setTimeout(() => {
      cleanup();
      // Only fall back to native mailto: if Gmail did not open and the tab never backgrounded
      if (!appOpened && document.visibilityState === 'visible' && Date.now() - startedAt < 3200) {
        window.location.href = MAILTO_COMPOSE_URL;
      }
    }, 2200);

    window.location.href = IOS_GMAIL_COMPOSE_URL;
    return;
  }

  if (isAndroidDevice()) {
    event.preventDefault();
    window.location.href = MAILTO_COMPOSE_URL;
  }
}
