import React, { useEffect, useState } from 'react';
import styles from './AhmadaiWelcome.module.css';

// A welcome bar for visitors redirected from ahmadai.com. The Cloudflare redirect adds
// utm_source=ahmadai.com, so the bar shows only for them. Its button scrolls to the newsletter
// form in the home page header and focuses the email field, so there is one Kit form on the page.
export default function AhmadaiWelcome() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const source = new URLSearchParams(window.location.search).get('utm_source');
    setVisible(source === 'ahmadai.com');
  }, []);

  if (!visible) return null;

  function goToNewsletter() {
    const input = document.querySelector('.formkit-input[name="email_address"]');
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
    }
  }

  return (
    <div className={styles.bar} role="region" aria-label="Welcome from ahmadai.com">
      <p className={styles.text}>
        <strong>Welcome from ahmadai.com.</strong> Ahmad's AI projects now live here at IntelliNode.
        Get the new AI agent guides by email.
      </p>
      <button type="button" className={styles.action} onClick={goToNewsletter}>
        Subscribe
      </button>
      <button type="button" className={styles.close} aria-label="Close" onClick={() => setVisible(false)}>
        ×
      </button>
    </div>
  );
}
