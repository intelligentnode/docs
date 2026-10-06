import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './KitSubscribe.module.css';

const BUTTON_TEXT = 'Subscribe';
const PLACEHOLDER = 'you@company.com';

// Embeds the Kit (formerly ConvertKit) inline signup form.
// Kit's per-form script renders the form inline at the position of the
// injected <script> tag. We inject it via a ref/effect because a raw
// <script> placed through dangerouslySetInnerHTML does not execute in React.
// Once Kit renders, we set our own button text and placeholder, and send a
// Google Analytics sign_up event when the form is submitted.
// variant="hero" is the home page card; variant="inline" is the compact card
// shown at the end of articles and docs pages.
export default function KitSubscribe({ variant = 'hero' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.querySelector('script')) return; // avoid double-inject

    const tracked = new WeakSet();
    const adjust = () => {
      const input = container.querySelector('.formkit-input[name="email_address"]');
      if (input && input.placeholder !== PLACEHOLDER) {
        input.placeholder = PLACEHOLDER;
        input.setAttribute('aria-label', 'Email address');
      }
      const label = container.querySelector('.formkit-submit > span');
      if (label && label.textContent !== BUTTON_TEXT) label.textContent = BUTTON_TEXT;
      const form = container.querySelector('form');
      if (form && !tracked.has(form)) {
        tracked.add(form);
        form.addEventListener('submit', () => {
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'sign_up', { method: 'newsletter', page_path: window.location.pathname });
          }
        });
      }
    };
    const observer = new MutationObserver(adjust);
    observer.observe(container, { childList: true, subtree: true });

    const script = document.createElement('script');
    script.src = 'https://intellinode.kit.com/c6d9ce28de/index.js';
    script.async = true;
    script.setAttribute('data-uid', 'c6d9ce28de');
    container.appendChild(script);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={clsx(styles.card, variant === 'inline' && styles.inline)}>
      <p className={styles.title}>Stay ahead with Super AI.</p>
      <p className={styles.pitch}>New AI agent guides straight to your inbox.</p>
      <div ref={containerRef} className={styles.formHost} />
    </div>
  );
}
