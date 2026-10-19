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
// variant="hero" is the card on the contact and newsletter pages; variant="inline" is the
// compact card shown at the end of articles and docs pages; variant="bare" is only the form,
// for the home page header, which sets its own heading.
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
        // Kit renders a plain text field: ask for the email keyboard and for autofill
        input.setAttribute('autocomplete', 'email');
        input.setAttribute('inputmode', 'email');
        input.setAttribute('autocapitalize', 'none');
        input.setAttribute('spellcheck', 'false');
      }
      // Kit's error and success messages are read out when they appear
      container.querySelectorAll('[data-group="alert"]').forEach((alert) => alert.setAttribute('aria-live', 'polite'));
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

  if (variant === 'bare') {
    return (
      <div className={styles.bare}>
        <div ref={containerRef} className={styles.formHost} />
      </div>
    );
  }

  return (
    <div className={clsx(styles.card, variant === 'inline' && styles.inline)}>
      <p className={styles.title}>Get the next agent guide in your inbox.</p>
      <div ref={containerRef} className={styles.formHost} />
    </div>
  );
}
