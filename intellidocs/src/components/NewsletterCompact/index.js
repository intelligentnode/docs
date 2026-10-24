import React, {useId, useState} from 'react';
import clsx from 'clsx';
import {
  BUTTON_TEXT,
  FORM_ACTION,
  NEWSLETTER_LEAD,
  NEWSLETTER_TITLE,
  PLACEHOLDER,
  sendSignUpEvent,
} from '@site/src/components/KitSubscribe';
import styles from './styles.module.css';

// the same words as the Kit form's own success message
const SUCCESS = 'Almost there. Check your inbox to confirm your email. If it is not there, look in spam.';

// A small newsletter form for places where readers are, not only at the end of a page:
// after an article's intro (placement="article") and under "On this page" (placement="toc").
// It does not load Kit's script. It posts to the same Kit endpoint the way Kit's own script
// does (JSON, from this origin) and shows the result in place. Before the page's JavaScript
// runs, or if that request fails, it is a plain form that posts to Kit directly.
export default function NewsletterCompact({placement}) {
  const inputId = useId();
  const titleId = useId();
  const [state, setState] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.append('referrer', document.referrer);
    data.append('host', window.location.href);
    data.append('search', window.location.search);
    data.append('ckjs_version', '6');
    setState('sending');
    setError('');
    let result;
    try {
      const response = await fetch(FORM_ACTION, {
        method: 'POST',
        body: data,
        headers: {Accept: 'application/json', 'X-CKJS-Version': '6'},
      });
      result = response.ok ? await response.json() : null;
    } catch {
      result = null;
    }
    if (!result) {
      // the in-page request failed: send the plain form to Kit instead
      sendSignUpEvent(placement);
      form.submit();
      return;
    }
    if (result.status === 'success') {
      sendSignUpEvent(placement);
      setState('done');
    } else if (result.status === 'quarantined' && result.url) {
      // Kit wants a quick check that a person is signing up
      sendSignUpEvent(placement);
      window.location.assign(result.url);
    } else {
      setState('idle');
      setError(result.errors?.messages?.join(' ') || 'That did not go through. Please try again.');
    }
  }

  return (
    <aside className={clsx(styles.box, styles[placement])} aria-labelledby={titleId}>
      <p id={titleId} className={styles.title}>
        {NEWSLETTER_TITLE}
      </p>
      {placement === 'article' && <p className={styles.lead}>{NEWSLETTER_LEAD}</p>}
      {state === 'done' ? (
        <p className={styles.done} role="status">
          {SUCCESS}
        </p>
      ) : (
        <form className={styles.form} action={FORM_ACTION} method="post" onSubmit={onSubmit}>
          <label htmlFor={inputId} className={styles.srOnly}>
            Email address
          </label>
          <input
            id={inputId}
            className={styles.input}
            type="email"
            name="email_address"
            placeholder={PLACEHOLDER}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
          <button className={styles.button} type="submit" disabled={state === 'sending'}>
            {state === 'sending' ? 'Subscribing…' : BUTTON_TEXT}
          </button>
        </form>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </aside>
  );
}
