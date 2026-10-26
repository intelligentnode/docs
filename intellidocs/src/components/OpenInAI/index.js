import React, {useState} from 'react';
import styles from './styles.module.css';

// "Build it with AI" box for an article: opens a new Gemini or ChatGPT chat with a request
// that points to the article and asks the assistant to implement it with the reader.
// ChatGPT reads the request from the ?q= parameter. Gemini ignores URL parameters, so its
// button copies the request to the clipboard and opens an empty chat to paste it into.
const TARGETS = [
  {name: 'Gemini', url: 'https://gemini.google.com/app', copy: true},
  {name: 'ChatGPT', url: 'https://chatgpt.com/?q='},
];

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
  const [copied, setCopied] = useState(false);

  function handleClick(target) {
    sendOpenEvent(target.name);
    if (target.copy && navigator.clipboard) {
      navigator.clipboard.writeText(prompt).then(
        () => setCopied(true),
        () => {},
      );
    }
  }

  return (
    <aside className={styles.box} aria-label="Build this with an AI assistant">
      <p className={styles.title}>Build it with an AI assistant</p>
      <p className={styles.lead}>
        Opens a new chat with a ready request to build this agent with you, step by step. For
        Gemini, the request is copied for you to paste into the chat.
      </p>
      <div className={styles.buttons}>
        {TARGETS.map((target) => (
          <a
            key={target.name}
            className={styles.button}
            href={target.copy ? target.url : target.url + encodeURIComponent(prompt)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(target)}>
            Open in {target.name}
            <span className={styles.arrow} aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
      <p className={styles.note} role="status">
        {copied ? 'Request copied. Paste it into the Gemini chat and send it.' : ''}
      </p>
    </aside>
  );
}
