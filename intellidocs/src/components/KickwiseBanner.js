import React, { useEffect, useState } from 'react';
import styles from './KickwiseBanner.module.css';

// A small dismissible promo ("ad") banner shown on the home page. It slides in shortly
// after load and links to Kickwise (the football prediction + live-stats app built by
// IntelliNode). It shows on every home-page visit; closing it (or clicking through)
// snoozes it for 24 hours so it doesn't nag, then it returns.
const STORAGE_KEY = 'kickwise_banner_snoozed_until';
const SNOOZE_MS = 24 * 60 * 60 * 1000; // 24 hours
// utm_source tags the click so Kickwise's PostHog can count visitors arriving from these docs
// (utm_content tells the popup apart from the footer link).
const KICKWISE_URL = 'https://kickwise.ai/?utm_source=intellinode&utm_medium=referral&utm_campaign=docs&utm_content=popup';

export default function KickwiseBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Client-only: show on every visit unless snoozed within the last 24h. Brief delay for a nicer pop.
    let snoozed = false;
    try {
      const until = parseInt(window.localStorage.getItem(STORAGE_KEY) || '', 10);
      snoozed = Number.isFinite(until) && Date.now() < until;
    } catch (e) {
      /* localStorage unavailable (private mode) — just show it */
    }
    if (snoozed) return undefined;
    const timer = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  // Hide for the next 24 hours; it returns on a later home-page visit.
  function snooze() {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now() + SNOOZE_MS));
    } catch (e) {
      /* ignore */
    }
  }

  function dismiss(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setVisible(false);
    snooze();
  }

  if (!visible) return null;

  return (
    <aside
      className={styles.banner}
      role="complementary"
      aria-label="Kickwise AI football predictions and live stats"
    >
      <button type="button" className={styles.close} aria-label="Close" onClick={dismiss}>
        ×
      </button>
      <a
        className={styles.link}
        href={KICKWISE_URL}
        target="_blank"
        rel="noopener"
        onClick={snooze}
      >
        <span className={styles.icon} aria-hidden="true">⚽</span>
        <span className={styles.body}>
          <span className={styles.badge}>Built by IntelliNode</span>
          <span className={styles.title}>Kickwise AI Football Predictions</span>
          <span className={styles.subtitle}>Get instant AI match predictions and live stats for every game. Free to try!</span>
          <span className={styles.cta}>Try Kickwise free →</span>
        </span>
      </a>
    </aside>
  );
}
