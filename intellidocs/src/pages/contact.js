import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import KitSubscribe from '@site/src/components/KitSubscribe';
import styles from './simple.module.css';

const TEAM_EMAIL = 'intellinode.comp@gmail.com';
const ALEX_EMAIL = 'alex@intellinode.ai';

export default function Contact() {
  return (
    <Layout
      title="Contact IntelliNode"
      description="Contact the IntelliNode team about Intelli, IntelliNode, partnerships or an AI use case you want to build.">
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Get in touch.</h1>
          <p className={styles.lead}>
            Questions about Intelli or IntelliNode, a partnership, or an AI use case you want to build? Write to us and a
            person will reply.
          </p>
        </header>

        <div className={styles.grid}>
          <section className={styles.tile}>
            <h2>Email the team</h2>
            <a href={`mailto:${TEAM_EMAIL}`}>{TEAM_EMAIL}</a>
          </section>
          <section className={styles.tile}>
            <h2>Write to Alex</h2>
            <a href={`mailto:${ALEX_EMAIL}`}>{ALEX_EMAIL}</a>
          </section>
          <section className={styles.tile}>
            <h2>Share your AI use case</h2>
            <p>Tell us your role, the problem you want to solve and the models you use today. We'll point you to the
              closest example, or help you plan it.</p>
            <a className={styles.action} href={`mailto:${TEAM_EMAIL}?subject=My%20AI%20use%20case`}>Share your use case</a>
          </section>
        </div>

        <div className={styles.grid}>
          <section className={styles.tile}>
            <h2>Found a bug?</h2>
            <p>
              Open an issue on GitHub for <Link to="https://github.com/intelligentnode/Intelli/issues">Intelli</Link> (Python)
              or <Link to="https://github.com/intelligentnode/IntelliNode/issues">IntelliNode</Link> (Node.js).
            </p>
          </section>
          <section className={styles.tile}>
            <h2>Talk with other builders</h2>
            <p>
              Join the <Link to="https://discord.gg/VYgCh2p3Ww">IntelliNode Discord</Link> to ask questions and share what
              you build.
            </p>
          </section>
        </div>

        <KitSubscribe />
      </main>
    </Layout>
  );
}
