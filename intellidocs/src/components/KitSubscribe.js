import React, { useEffect, useId, useRef } from 'react';
import clsx from 'clsx';
import styles from './KitSubscribe.module.css';

const FORM_ACTION = 'https://app.kit.com/forms/9607296/subscriptions';
const BUTTON_TEXT = 'Subscribe';
const PLACEHOLDER = 'you@company.com';

function trackSignUp() {
  if (typeof window.gtag === 'function') {
    // beacon, so the event still goes out when the plain form leaves the page for Kit
    window.gtag('event', 'sign_up', {
      method: 'newsletter',
      page_path: window.location.pathname,
      transport_type: 'beacon',
    });
  }
}

// The newsletter email field on the page: Kit's once its script has rendered the form, otherwise
// the plain form that stands in for it.
export function findNewsletterInput() {
  return (
    document.querySelector('.formkit-form .formkit-input[name="email_address"]') ||
    document.querySelector(`.${styles.fallback}:not([hidden]) input[name="email_address"]`)
  );
}

// Embeds the Kit (formerly ConvertKit) inline signup form.
// Kit's per-form script renders the form inline at the position of the
// injected <script> tag. We inject it via a ref/effect because a raw
// <script> placed through dangerouslySetInnerHTML does not execute in React.
// Once Kit renders, we set our own button text and placeholder, and send a
// Google Analytics sign_up event when the form is submitted.
// Until then, and for good when an ad blocker or a slow connection stops Kit's script, a plain
// form from the server HTML posts to the same Kit endpoint. It reuses Kit's class names, so it
// looks the same, and it sits beside the div that Kit's script fills, never inside it.
// variant="hero" is the card on the contact and newsletter pages; variant="inline" is the
// compact card shown at the end of articles and docs pages; variant="bare" is only the form,
// for the home page header, which sets its own heading.
export default function KitSubscribe({ variant = 'hero' }) {
  const containerRef = useRef(null);
  const fallbackRef = useRef(null);
  const inputId = useId();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.querySelector('script')) return; // avoid double-inject

    const tracked = new WeakSet();
    const adjust = () => {
      const form = container.querySelector('form.formkit-form');
      if (!form) return;
      const input = form.querySelector('.formkit-input[name="email_address"]');
      if (input && input.placeholder !== PLACEHOLDER) {
        input.placeholder = PLACEHOLDER;
        input.setAttribute('aria-label', 'Email address');
        // Kit renders a plain text field: ask for the email keyboard and for autofill
        input.setAttribute('autocomplete', 'email');
        input.setAttribute('inputmode', 'email');
        input.setAttribute('autocapitalize', 'none');
        input.setAttribute('spellcheck', 'false');
      }
      // Kit's form takes the plain form's place in the same reserved box, before the next paint.
      // An email already typed there moves across, and so does the focus.
      const fallback = fallbackRef.current;
      if (input && fallback && !fallback.hidden) {
        const typed = fallback.elements.email_address;
        if (typed.value && !input.value) input.value = typed.value;
        if (document.activeElement === typed) input.focus({ preventScroll: true });
        fallback.hidden = true;
      }
      // Kit's error and success messages are read out when they appear
      form.querySelectorAll('[data-group="alert"]').forEach((alert) => alert.setAttribute('aria-live', 'polite'));
      const label = form.querySelector('.formkit-submit > span');
      if (label && label.textContent !== BUTTON_TEXT) label.textContent = BUTTON_TEXT;
      if (!tracked.has(form)) {
        tracked.add(form);
        form.addEventListener('submit', trackSignUp);
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

  const formHost = (
    <div className={styles.formHost}>
      <div ref={containerRef} />
      <form ref={fallbackRef} className={styles.fallback} action={FORM_ACTION} method="post" onSubmit={trackSignUp}>
        <label htmlFor={inputId} className={styles.srOnly}>
          Email address
        </label>
        <div className="formkit-fields">
          <div className="formkit-field">
            <input
              id={inputId}
              className="formkit-input"
              type="email"
              name="email_address"
              placeholder={PLACEHOLDER}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </div>
          <button type="submit" className="formkit-submit">
            {BUTTON_TEXT}
          </button>
        </div>
      </form>
    </div>
  );

  if (variant === 'bare') {
    return <div className={styles.bare}>{formHost}</div>;
  }

  return (
    <div className={clsx(styles.card, variant === 'inline' && styles.inline)}>
      <p className={styles.title}>Get the next agent guide in your inbox.</p>
      {formHost}
    </div>
  );
}
