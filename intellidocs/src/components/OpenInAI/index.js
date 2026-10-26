import React from 'react';
import styles from './styles.module.css';

// "Build it with AI" box for an article: opens a new ChatGPT chat with a request that points
// to the article and asks the assistant to implement it with the reader. ChatGPT reads the
// request from the ?q= parameter. Claude shows a caution banner for such links and Gemini
// ignores URL parameters, so neither is offered.
const TARGETS = [{name: 'ChatGPT', url: 'https://chatgpt.com/?q='}];

function sendOpenEvent(assistant) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'open_in_ai', {
      assistant,
      page_path: window.location.pathname,
      transport_type: 'beacon',
    });
  }
}

export default function OpenInAI({prompt}) {
  return (
    <aside className={styles.box} aria-label="Build this with an AI assistant">
      <p className={styles.title}>Build it with an AI assistant</p>
      <p className={styles.lead}>
        Opens a new chat with this guide and a ready request to build it with you, step by step.
      </p>
      <div className={styles.buttons}>
        {TARGETS.map(({name, url}) => (
          <a
            key={name}
            className={styles.button}
            href={url + encodeURIComponent(prompt)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendOpenEvent(name)}>
            Open in {name}
            <span className={styles.arrow} aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </aside>
  );
}
