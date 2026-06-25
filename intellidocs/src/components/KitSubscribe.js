import React, { useEffect, useRef } from 'react';
import styles from './KitSubscribe.module.css';

// Embeds the Kit (formerly ConvertKit) inline signup form.
// Kit's per-form script renders the form inline at the position of the
// injected <script> tag. We inject it via a ref/effect because a raw
// <script> placed through dangerouslySetInnerHTML does not execute in React.
// The surrounding card + heading and the .formkit-* overrides in
// KitSubscribe.module.css replicate the styling already live on intellinode.ai.
export default function KitSubscribe() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.querySelector('script')) return; // avoid double-inject

    const script = document.createElement('script');
    script.src = 'https://intellinode.kit.com/c6d9ce28de/index.js';
    script.async = true;
    script.setAttribute('data-uid', 'c6d9ce28de');
    container.appendChild(script);
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.heading}>Join the community of AI builders</div>
      <div ref={containerRef} className={styles.formHost} />
    </div>
  );
}
