/**
 * Adds NewsletterInline to the components every MDX page can use. The remark plugin
 * src/plugins/remark-newsletter-inline.js places it after each article's intro.
 */
import React from 'react';
import {useLocation} from '@docusaurus/router';
import MDXComponents from '@theme-original/MDXComponents';
import NewsletterCompact from '@site/src/components/NewsletterCompact';
import {isArticlePage} from '@site/src/utils/articles';

function NewsletterInline() {
  const {pathname} = useLocation();
  return isArticlePage(pathname) ? <NewsletterCompact placement="article" /> : null;
}

export default {
  ...MDXComponents,
  NewsletterInline,
};
