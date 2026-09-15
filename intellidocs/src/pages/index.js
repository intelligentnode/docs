import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Features from '@site/src/components/features';

import Heading from '@theme/Heading';
import styles from './index.module.css';
import KitSubscribe from '@site/src/components/KitSubscribe';
// Kickwise popup is disabled for now. Uncomment this import and the
// <KickwiseBanner /> line below to bring it back.
// import KickwiseBanner from '@site/src/components/KickwiseBanner';

function Header() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Open Source AI Framework
        </Heading>
        <p className="hero__subtitle">
          {siteConfig.tagline}
          <br />
          <Link
            to="https://towardsdatascience.com/agents-that-write-agents/?source=intellidoc"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.articleLink}
            style={{ fontSize: '1.1rem' }}
          >
            As mentioned in Towards Data Science
          </Link>
        </p>
        <div style={{ marginTop: '2rem', width: '100%', maxWidth: '100%' }}>
          <KitSubscribe />
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Open Source AI Framework for Python and Node.js"
      description="IntelliNode is an open source AI framework for Python and Node.js: one API for OpenAI, Claude, Gemini and local models, with agents and MCP.">
      <Head>
        <meta name="keywords" content="intellinode, intelli, open source ai framework, llm framework, python ai library, node.js ai library, ai agents, mcp server, openai, anthropic claude, gemini" />
      </Head>
      <Header />
      <main>
        <Features />
      </main>
      {/* <KickwiseBanner /> */}
    </Layout>
  );
}
