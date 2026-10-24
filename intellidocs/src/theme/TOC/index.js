/**
 * The "On this page" column on docs and article pages, with a small newsletter form under it.
 * The table of contents and the form stay in view together while the reader scrolls.
 * Desktop only: phones use the collapsible table of contents, which this does not change.
 */
import React from 'react';
import clsx from 'clsx';
import TOC from '@theme-original/TOC';
import NewsletterCompact from '@site/src/components/NewsletterCompact';
import styles from './styles.module.css';

export default function TOCWrapper(props) {
  return (
    <div className={styles.rail}>
      <TOC {...props} className={clsx(props.className, styles.toc)} />
      <NewsletterCompact placement="toc" />
    </div>
  );
}
