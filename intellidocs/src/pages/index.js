import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import {usePluginData} from '@docusaurus/useGlobalData';
import Features from '@site/src/components/features';
import KitSubscribe from '@site/src/components/KitSubscribe';
import AhmadaiWelcome from '@site/src/components/AhmadaiWelcome';
import interTight from '@site/src/fonts/inter-tight-latin.woff2';

import styles from './index.module.css';
// Kickwise popup is disabled for now. Uncomment this import and the
// <KickwiseBanner /> line below to bring it back.
// import KickwiseBanner from '@site/src/components/KickwiseBanner';

const TDS_ARTICLE = 'https://towardsdatascience.com/agents-that-write-agents/?source=intellidoc';
const IEEE_PAPER = 'https://ieeexplore.ieee.org/document/11177136';

function ExternalArrow() {
  return (
    <svg className={styles.ext} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M4 2h6v6M10 2 3 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NextArrow() {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The header holds only the main parts: the headline with one highlighter stroke, the tagline,
// the Towards Data Science mention and the newsletter. The rest lives in the sections below.
function Header() {
  return (
    <header className={styles.hero}>
      <div className={styles.wrap}>
        <AhmadaiWelcome />
        <p className={styles.eyebrow}>
          Open source AI agent framework<span className={styles.lgOnly}> for Python and Node.js</span>
        </p>
        <div className={clsx(styles.grid, styles.heroGrid)}>
          <h1 className={styles.title}>
            <span className={styles.l1}>
              <span className={styles.hl}>Super Intelligence</span>
            </span>{' '}
            <span className={styles.l2}>is open.</span>
          </h1>
          <div className={styles.lede}>
            <p className={styles.tagline}>
              <span className={styles.nw}>Build hundreds of super agents,</span>{' '}
              <span className={styles.nw}>RAG and MCP apps.</span>
            </p>
            <p className={styles.press}>
              As mentioned in{' '}
              <Link to={TDS_ARTICLE} target="_blank" rel="noopener noreferrer">
                Towards Data Science
                <ExternalArrow />
              </Link>
            </p>
          </div>
          <section className={styles.signup} aria-labelledby="newsletter-title">
            <h2 id="newsletter-title" className={styles.signupTitle}>
              Get the next agent guide in your inbox.
            </h2>
            <KitSubscribe variant="bare" note="Free. Unsubscribe anytime." />
          </section>
        </div>
      </div>
    </header>
  );
}

// Install and research on the left; the newest articles on the right, under the newsletter.
// The articles come from the recent-guides plugin, so the list updates on every build.
function Details() {
  const {guides} = usePluginData('recent-guides');
  return (
    <section className={styles.details} aria-label="Install, research and recent guides">
      <div className={clsx(styles.wrap, styles.grid)}>
        <div className={styles.start}>
          <div className={styles.blockHead}>
            <h2>Install</h2>
          </div>
          <ul className={styles.install}>
            <li>
              <Link to="/docs/python/">
                <span className={styles.lang}>Python</span>
                <code>pip install intelli</code>
                <span className={styles.go}>Docs <NextArrow /></span>
              </Link>
            </li>
            <li>
              <Link to="/docs/npm/">
                <span className={styles.lang}>Node.js</span>
                <code>npm i intellinode</code>
                <span className={styles.go}>Docs <NextArrow /></span>
              </Link>
            </li>
          </ul>
          <p className={styles.paper}>
            <Link to={IEEE_PAPER} target="_blank" rel="noopener noreferrer">
              Used in an <b>IEEE CIBCB 2025</b> paper on{' '}
              <i>
                multi-agent ICU prediction
                <ExternalArrow />
              </i>
            </Link>
          </p>
        </div>

        <div className={styles.recent}>
          <div className={styles.blockHead}>
            <h2>Recent guides</h2>
            <Link to="/articles">All articles</Link>
          </div>
          <ol>
            {guides.map((guide) => (
              <li key={guide.permalink}>
                <Link to={guide.permalink}>
                  <time dateTime={guide.date}>{guide.label}</time>
                  <span className={styles.guideTitle}>{guide.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    // wrapperClassName marks the home page, so custom.css can line the navbar and footer up with its grid
    <Layout
      wrapperClassName="home-page"
      title="Open Source AI Agent Framework for Python and Node.js"
      description="Open source AI agent framework for Python and Node.js. Build AI agents, RAG chatbots and MCP servers on OpenAI, Claude, Gemini or local models with vLLM.">
      <Head>
        <meta property="og:title" content="Super Intelligence is open source | IntelliNode" />
        <meta name="twitter:title" content="Super Intelligence is open source | IntelliNode" />
        <meta property="og:description" content="Build SI agents, RAG and MCP apps. Open source and model agnostic, in Python and Node.js." />
        <meta name="twitter:description" content="Build SI agents, RAG and MCP apps. Open source and model agnostic, in Python and Node.js." />
        <meta name="keywords" content="open source ai agent framework, ai agent framework, build ai agents, llm framework, rag chatbot, mcp server, python ai library, node.js ai sdk, vllm, claude code, openai, anthropic claude, gemini, intellinode, intelli" />
        {/* the headline font, so the first paint already uses it */}
        <link rel="preload" href={interTight} as="font" type="font/woff2" crossOrigin="anonymous" />
      </Head>
      <div className={styles.page}>
        <Header />
        <main>
          <Details />
          <Features />
        </main>
      </div>
      {/* <KickwiseBanner /> */}
    </Layout>
  );
}
