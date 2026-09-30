/**
 * Articles index: a card grid with an All / Python / Node.js filter.
 * Every card is rendered on the server, so crawlers see all articles.
 * The filter only hides cards in the browser and mirrors its state in ?lang=.
 */
import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import SearchMetadata from '@theme/SearchMetadata';
import styles from './styles.module.css';

const FILTERS = [
  {id: 'all', label: 'All'},
  {id: 'python', label: 'Python'},
  {id: 'nodejs', label: 'Node.js'},
];

const LANGUAGE_LABELS = {python: 'Python', nodejs: 'Node.js'};

// Each article carries a language tag whose permalink ends in /python or /nodejs.
function articleLanguage(metadata) {
  const slugs = metadata.tags.map((tag) => tag.permalink.split('/').pop());
  return slugs.find((slug) => slug in LANGUAGE_LABELS) ?? null;
}

function readFilterFromUrl() {
  try {
    const value = new URLSearchParams(window.location.search).get('lang');
    return FILTERS.some((filter) => filter.id === value) ? value : 'all';
  } catch {
    return 'all';
  }
}

function writeFilterToUrl(filter) {
  try {
    const url = new URL(window.location.href);
    if (filter === 'all') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', filter);
    }
    window.history.replaceState(null, '', url);
  } catch {
    // The filter still works without the URL state.
  }
}

function ArticleCard({content}) {
  const {metadata, frontMatter} = content;
  const {permalink, title, description, date, formattedDate, readingTime} = metadata;
  const language = articleLanguage(metadata);
  const image = useBaseUrl(frontMatter.image ?? '');
  const minutes = readingTime ? Math.max(1, Math.ceil(readingTime)) : null;

  return (
    <article className={styles.card}>
      {frontMatter.image && (
        <Link to={permalink} className={styles.cardImageLink} tabIndex={-1} aria-hidden="true">
          <img
            className={styles.cardImage}
            src={image}
            alt=""
            width="1200"
            height="630"
            loading="lazy"
            decoding="async"
          />
        </Link>
      )}
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          {language && (
            <span className={clsx(styles.chip, styles[`chip_${language}`])}>
              {LANGUAGE_LABELS[language]}
            </span>
          )}
          <time dateTime={date}>{formattedDate}</time>
          {minutes && <span>{minutes} min read</span>}
        </div>
        <h2 className={styles.cardTitle}>
          <Link to={permalink}>{title}</Link>
        </h2>
        <p className={styles.cardDescription}>{description}</p>
        <Link to={permalink} className={styles.readMore} aria-label={`Read ${title}`}>
          Read the article
        </Link>
      </div>
    </article>
  );
}

function ItemListJsonLd({items}) {
  const {siteConfig} = useDocusaurusContext();
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map(({content}, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteConfig.url}${content.metadata.permalink}`,
      name: content.metadata.title,
    })),
  };
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Head>
  );
}

export default function BlogListPage({metadata, items}) {
  const {blogTitle, blogDescription} = metadata;
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setFilter(readFilterFromUrl());
  }, []);

  const choose = (id) => {
    setFilter(id);
    writeFilterToUrl(id);
  };

  const counts = {all: items.length};
  items.forEach(({content}) => {
    const language = articleLanguage(content.metadata);
    if (language) counts[language] = (counts[language] ?? 0) + 1;
  });

  const visible = items.filter(
    ({content}) => filter === 'all' || articleLanguage(content.metadata) === filter,
  );

  return (
    <Layout title={blogTitle} description={blogDescription} wrapperClassName="blog-wrapper blog-list-page">
      <SearchMetadata tag="blog_posts_list" />
      <ItemListJsonLd items={items} />
        <main className={clsx('container', styles.page)}>
          <header className={styles.header}>
            <h1 className={styles.title}>{blogTitle}</h1>
            <p className={styles.subtitle}>{blogDescription}</p>
          </header>

          <div className={styles.filters} role="group" aria-label="Filter articles by language">
            {FILTERS.map(({id, label}) => (
              <button
                key={id}
                type="button"
                className={clsx(styles.filterButton, filter === id && styles.filterButtonActive)}
                aria-pressed={filter === id}
                onClick={() => choose(id)}>
                {label}
                <span className={styles.count}>{counts[id] ?? 0}</span>
              </button>
            ))}
          </div>

          <p className={styles.srOnly} aria-live="polite">
            {`Showing ${visible.length} of ${items.length} articles`}
          </p>

          <div className={styles.grid}>
            {items.map((item) => {
              const shown = visible.includes(item);
              return (
                <div
                  key={item.content.metadata.permalink}
                  className={styles.gridItem}
                  hidden={!shown}>
                  <ArticleCard content={item.content} />
                </div>
              );
            })}
          </div>

          {visible.length === 0 && (
            <p className={styles.empty}>No articles for this filter yet.</p>
          )}
        </main>
    </Layout>
  );
}
