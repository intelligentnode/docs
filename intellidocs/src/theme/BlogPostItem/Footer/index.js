/**
 * Adds the newsletter card under the article body, before the previous / next links.
 * BlogPostItem also renders on tag and archive lists, so the card shows only on an article's own page.
 */
import React from 'react';
import {useLocation} from '@docusaurus/router';
import Footer from '@theme-original/BlogPostItem/Footer';
import KitSubscribe from '@site/src/components/KitSubscribe';

const LIST_PAGES = new Set(['tags', 'page', 'archive', 'authors']);

function isArticlePage(pathname) {
  const [section, slug] = pathname.split('/').filter(Boolean);
  return section === 'articles' && Boolean(slug) && !LIST_PAGES.has(slug);
}

export default function FooterWrapper(props) {
  const {pathname} = useLocation();
  return (
    <>
      <Footer {...props} />
      {isArticlePage(pathname) && <KitSubscribe variant="inline" />}
    </>
  );
}
