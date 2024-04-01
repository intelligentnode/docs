import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

const terminalGif = require('@site/static/img/terminal_small.gif').default;

const FeatureList = [
  {
    title: 'Any Model Access',
    imgSrc: require('@site/static/img/any-model-access.png').default,
    description: (
      <>
        Connect various AI models using a unified input layer with minimum change.
      </>
    ),
  },
  {
    title: 'Evaluation',
    imgSrc: require('@site/static/img/evaluation.png').default,
    description: (
      <>
        Run continuous evaluation across multiple models with metrics.
      </>
    ),
  },
  {
    title: 'Optimized Workflow',
    imgSrc: require('@site/static/img/neural.png').default,
    description: (
      <>
        Manage the relations between multiple AI models as a graph of tasks.
      </>
    ),
  },
];

function Feature({imgSrc, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img className={styles.featureSvg} src={imgSrc} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        <div className="row" style={{paddingTop: '20px'}}> 
          <div className="col col--12"> 
            <div className="text--center">
              <img src={terminalGif} alt="Terminal" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
