/**
 * Adds the newsletter card at the end of every docs page, before the previous / next links.
 */
import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import KitSubscribe from '@site/src/components/KitSubscribe';

export default function FooterWrapper(props) {
  return (
    <>
      <Footer {...props} />
      <KitSubscribe variant="inline" />
    </>
  );
}
