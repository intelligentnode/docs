import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Features from '@site/src/components/features';

import Heading from '@theme/Heading';
import styles from './index.module.css';
import Head from '@docusaurus/Head';

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
            style={{ fontSize: '1.1rem' }}
          >
            As mentioned in Towards Data Science
          </Link>
        </p>
        <div style={{ marginTop: '2rem', width: '100%', maxWidth: '100%' }}>
          <div dangerouslySetInnerHTML={{ __html: `
<div id="mc_embed_signup">
    <form action="https://intellinode.us10.list-manage.com/subscribe/post?u=bfbc78f1a195b85e6d516404b&amp;id=049ef7077e&amp;f_id=00cf54e4f0" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank">
        <div id="mc_embed_signup_scroll">
            <div class="indicates-required">Get latest updates</div>
            <div class="mc-field-group"><label for="mce-EMAIL">Email Address <span class="asterisk">*</span></label><input type="email" name="EMAIL" class="required email" id="mce-EMAIL" required="" value=""></div>
        <div id="mce-responses" class="clear">
            <div class="response" id="mce-error-response" style="display: none;"></div>
            <div class="response" id="mce-success-response" style="display: none;"></div>
        </div><div aria-hidden="true" style="position: absolute; left: -5000px;"><input type="text" name="b_bfbc78f1a195b85e6d516404b_049ef7077e" tabindex="-1" value=""></div><div class="clear"><input type="submit" name="subscribe" id="mc-embedded-subscribe" class="button" value="Subscribe"></div>
    </div>
</form>
</div>
<script type="text/javascript" src="//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js"></script>
<script type="text/javascript">(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[2]='LNAME';ftypes[2]='text';fnames[3]='ADDRESS';ftypes[3]='address';fnames[4]='PHONE';ftypes[4]='phone';}(jQuery));var $mcj = jQuery.noConflict(true);</script>
          ` }} />
        </div>
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
      <Head>
        <style>{`
          #mc_embed_signup {
            background: #fff !important;
            clear: both !important;
            font: 14px Helvetica, Arial, sans-serif !important;
            width: 600px !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 30px 20px 15px 20px !important;
            border-radius: 8px;
            box-sizing: border-box !important;
          }
          
          #mc_embed_signup form {
            padding: 0 !important;
            margin: 0 !important;
            text-align: left !important;
          }
          
          #mc_embed_signup #mc_embed_signup_scroll {
            width: 100% !important;
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: flex-end !important;
            gap: 10px !important;
          }
          
          #mc_embed_signup .mc-field-group {
            flex: 1 1 300px !important;
            padding-bottom: 0 !important;
            margin-bottom: 0 !important;
            min-height: auto !important;
            clear: none !important;
          }
          
          #mc_embed_signup .mc-field-group label {
            display: block !important;
            margin-bottom: 6px !important;
            font-weight: 500 !important;
            font-size: 14px !important;
          }
          
          #mc_embed_signup .mc-field-group input[type="email"] {
            width: 100% !important;
            padding: 12px !important;
            font-size: 16px !important;
            border: 1px solid #ccc !important;
            border-radius: 4px !important;
            box-sizing: border-box !important;
            display: block !important;
            margin: 0 !important;
          }
          
          #mc_embed_signup .clear {
            clear: none !important;
            display: inline-block !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          
          #mc_embed_signup #mce-responses {
            width: 100% !important;
            flex-basis: 100% !important;
            order: 10 !important;
          }
          
          #mc_embed_signup input.button,
          #mc_embed_signup input[type="submit"] {
            width: auto !important;
            min-width: 150px !important;
            padding: 12px 30px !important;
            font-size: 16px !important;
            background-color: #000 !important;
            background: #000 !important;
            color: #fff !important;
            border: none !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: background-color 0.3s !important;
            display: inline-block !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            float: none !important;
            text-align: center !important;
            height: auto !important;
            white-space: nowrap !important;
          }
          
          #mc_embed_signup input.button:hover,
          #mc_embed_signup input[type="submit"]:hover {
            background-color: #333 !important;
            background: #333 !important;
          }
          
          #mc_embed_signup .indicates-required {
            width: 100% !important;
            flex-basis: 100% !important;
            text-align: center !important;
            font-weight: bold !important;
            margin-bottom: 15px !important;
            font-size: 16px !important;
            order: -1 !important;
          }
          
          #mc_embed_signup .asterisk {
            color: #e85c41 !important;
          }
          
          #mc_embed_signup #mce-responses {
            width: 100% !important;
            padding: 0 !important;
            margin: 10px 0 !important;
            float: none !important;
            clear: both !important;
          }
          
          #mc_embed_signup .response {
            margin: 10px 0 !important;
            padding: 10px !important;
            font-size: 14px !important;
          }
          
          @media (max-width: 768px) {
            #mc_embed_signup {
              width: 100% !important;
              padding: 20px 15px 10px 15px !important;
            }
            
            #mc_embed_signup #mc_embed_signup_scroll {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            
            #mc_embed_signup .indicates-required {
              display: none !important;
            }
            
            #mc_embed_signup .mc-field-group {
              flex: 1 1 100% !important;
              margin-bottom: 10px !important;
            }
            
            #mc_embed_signup .clear {
              width: 100% !important;
              display: block !important;
            }
            
            #mc_embed_signup input.button,
            #mc_embed_signup input[type="submit"] {
              width: 100% !important;
              min-width: auto !important;
            }
            
            #mc_embed_signup .mc-field-group input[type="email"],
            #mc_embed_signup input.button,
            #mc_embed_signup input[type="submit"] {
              font-size: 16px !important;
              padding: 12px !important;
            }
          }
        `}</style>
      </Head>
      <Header />
      <main>
        <Features />
      </main>
      
    </Layout>
  );
}
