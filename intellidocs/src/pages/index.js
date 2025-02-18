import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Features from '@site/src/components/features';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function Header() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">
          {siteConfig.tagline}
          <br />
          <Link
            to="https://towardsdatascience.com/graph-theory-to-harmonize-model-integration-e11b4827135a/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.articleLink}
            style={{ fontSize: '0.85rem' }}
          >
            As mentioned in Towards Data Science
          </Link>
        </p>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Create chatbots and AI workflows using intellinode.">
      <Header />
      <main>
        <Features />
      </main>
    </Layout>
  );
}
