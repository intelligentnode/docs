/**
 * Wraps the article page to add BlogPosting and BreadcrumbList structured data,
 * next to the default title, description, Open Graph and Twitter tags.
 * It reads the post from props, so it needs no internal theme hooks.
 */
import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BlogPostPage from '@theme-original/BlogPostPage';

const LIBRARIES = {
  python: {name: 'Intelli', path: '/docs/python'},
  nodejs: {name: 'IntelliNode', path: '/docs/npm'},
};

function absolute(siteUrl, path) {
  if (!path) return undefined;
  return /^https?:\/\//.test(path) ? path : `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function ArticleJsonLd({content}) {
  const {siteConfig} = useDocusaurusContext();
  const {metadata, frontMatter = {}, assets = {}} = content;
  const {title, description, date, permalink, tags, authors} = metadata;
  const siteUrl = siteConfig.url;
  const url = `${siteUrl}${permalink}`;
  const image = absolute(siteUrl, assets.image ?? frontMatter.image);
  const language = tags.map((tag) => tag.permalink.split('/').pop()).find((slug) => slug in LIBRARIES);
  const library = language ? LIBRARIES[language] : null;
  const keywords = Array.isArray(frontMatter.keywords) ? frontMatter.keywords.join(', ') : frontMatter.keywords;

  const posting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: title,
    description,
    url,
    mainEntityOfPage: {'@type': 'WebPage', '@id': url},
    datePublished: date,
    dateModified: frontMatter.last_update?.date ?? date,
    inLanguage: 'en',
    ...(image && {image: [image]}),
    ...(keywords && {keywords}),
    articleSection: tags.map((tag) => tag.label),
    author: authors.map((author) => ({
      '@type': 'Organization',
      name: author.name,
      ...(author.url && {url: author.url}),
    })),
    publisher: {'@id': `${siteUrl}/#organization`},
    isPartOf: {'@type': 'Blog', name: 'IntelliNode Articles', url: `${siteUrl}/articles`},
    ...(library && {
      about: {'@type': 'SoftwareSourceCode', name: library.name, url: `${siteUrl}${library.path}`},
    }),
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/`},
      {'@type': 'ListItem', position: 2, name: 'Articles', item: `${siteUrl}/articles`},
      {'@type': 'ListItem', position: 3, name: title, item: url},
    ],
  };

  // The site-wide og:image:alt describes the default social card, so each article sets its own.
  const imageAlt = frontMatter.image_alt ?? title;

  return (
    <Head>
      {image && <meta property="og:image:alt" content={imageAlt} />}
      {image && <meta name="twitter:image:alt" content={imageAlt} />}
      <script type="application/ld+json">{JSON.stringify(posting)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
    </Head>
  );
}

export default function BlogPostPageWrapper(props) {
  return (
    <>
      <ArticleJsonLd content={props.content} />
      <BlogPostPage {...props} />
    </>
  );
}
