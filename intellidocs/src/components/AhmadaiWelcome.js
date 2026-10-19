import React, { useState } from 'react';
import { findNewsletterInput } from './KitSubscribe';
import styles from './AhmadaiWelcome.module.css';

// A welcome bar for visitors redirected from ahmadai.com. The Cloudflare redirect adds
// utm_source=ahmadai.com, and a small script in the page head (headTags in docusaurus.config.js)
// then sets data-from="ahmadai" on <html> before the first paint. The bar is in the server HTML
// for every visitor and its CSS shows it only under that attribute, so it never pushes the header
// down after load. Its button scrolls to the newsletter form in the home page header and focuses
// the email field, so there is one signup form on the page.
export default function AhmadaiWelcome() {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  function goToNewsletter() {
    const input = findNewsletterInput();
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
    }
  }

  function close() {
    // so the bar stays closed when the visitor comes back to the home page
    delete document.documentElement.dataset.from;
    setClosed(true);
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
      <button type="button" className={styles.close} aria-label="Close" onClick={close}>
        ×
      </button>
    </div>
  );
}
