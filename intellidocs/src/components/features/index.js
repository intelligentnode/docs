import styles from './styles.module.css';

// The three framework features on the home page. The icons are one drawn set: ink outlines
// with one pale blue part, the same blue as the highlighter in the home page header.
function AnyModelIcon() {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <rect x="6" y="33" width="44" height="11" rx="3" fill="#C8E0FF" />
      <circle cx="13" cy="15" r="6" />
      <circle cx="28" cy="15" r="6" />
      <circle cx="43" cy="15" r="6" />
      <path d="M13 21V33M28 21V33M43 21V33" />
    </svg>
  );
}

function EvaluationIcon() {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <rect x="10" y="27" width="9" height="17" rx="1.5" />
      <rect x="23.5" y="13" width="9" height="31" rx="1.5" fill="#C8E0FF" />
      <rect x="37" y="32" width="9" height="12" rx="1.5" />
      <path d="M6 44H50" />
    </svg>
  );
}

function WorkflowIcon() {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M21.5 24.5L35.5 17M21.5 31.5L35.5 39" />
      <circle cx="15" cy="28" r="7.5" fill="#C8E0FF" />
      <circle cx="41" cy="14" r="6" />
      <circle cx="41" cy="42" r="6" />
    </svg>
  );
}

const FeatureList = [
  {
    title: 'Any Model Access',
    Icon: AnyModelIcon,
    description: 'Connect various AI models using a unified input layer with minimum change.',
  },
  {
    title: 'Evaluation',
    Icon: EvaluationIcon,
    description: 'Run continuous evaluation across multiple models with metrics.',
  },
  {
    title: 'Optimized Workflow',
    Icon: WorkflowIcon,
    description: 'Manage the relations between multiple AI models as a graph of tasks.',
  },
];

export default function Features() {
  return (
    <section className={styles.features} aria-labelledby="features-title">
      <div className={styles.wrap}>
        <h2 id="features-title" className={styles.srOnly}>Features</h2>
        <div className={styles.grid}>
          {FeatureList.map(({title, Icon, description}) => (
            <div key={title} className={styles.feature}>
              <Icon />
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
