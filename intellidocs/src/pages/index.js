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
          Super AI is open source
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
      title="Open Source AI Agent Framework for Python and Node.js"
      description="Open source AI agent framework for Python and Node.js. Build AI agents, RAG chatbots and MCP servers on OpenAI, Claude, Gemini or local models with vLLM.">
      <Head>
        <meta property="og:title" content="Super AI is open source | IntelliNode" />
        <meta name="twitter:title" content="Super AI is open source | IntelliNode" />
        <meta property="og:description" content="Build SI agents, RAG and MCP apps. Open source and model agnostic, in Python and Node.js." />
        <meta name="twitter:description" content="Build SI agents, RAG and MCP apps. Open source and model agnostic, in Python and Node.js." />
        <meta name="keywords" content="open source ai agent framework, ai agent framework, build ai agents, llm framework, rag chatbot, mcp server, python ai library, node.js ai sdk, vllm, claude code, openai, anthropic claude, gemini, intellinode, intelli" />
      </Head>
      <Header />
      <main>
        <Features />
      </main>
      {/* <KickwiseBanner /> */}
    </Layout>
  );
}
