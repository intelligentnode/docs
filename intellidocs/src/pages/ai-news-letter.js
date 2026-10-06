import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import KitSubscribe from '@site/src/components/KitSubscribe';
import styles from './simple.module.css';

const ITEMS = [
  {
    title: 'Agent guides',
    text: 'Step by step guides for building AI agents, RAG and MCP apps with open source tools.',
  },
  {
    title: 'Releases',
    text: "What's new in Intelli and IntelliNode, and what it changes for your projects.",
  },
  {
    title: 'Model choices',
    text: 'Which models fit which job, from cloud APIs to models that run on your own machine.',
  },
];

export default function AiNewsletter() {
  return (
    <Layout
      title="AI Newsletter: The AI Brief"
      description="The AI Brief: a short newsletter for engineers and leaders building with AI agents, RAG and MCP. New guides and IntelliNode releases, no spam.">
      <main className={clsx(styles.page, styles.compact)}>
        <header className={styles.header}>
          <h1 className={styles.title}>The AI Brief.</h1>
          <p className={styles.lead}>A short newsletter for engineers and leaders building with AI.</p>
        </header>

        <KitSubscribe />

        <div className={clsx(styles.grid, styles.after)}>
          {ITEMS.map(({title, text}) => (
            <section key={title} className={styles.tile}>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
      </main>
    </Layout>
  );
}
