// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// The site is served from the root domain; docs.intellinode.ai and intellinode.ai redirect here.
const siteUrl = 'https://www.intellinode.ai';
const siteDescription = 'Open source AI framework for Python and Node.js: one API for OpenAI, Anthropic, Gemini and local models, with agents, MCP and model evaluation.';

// Structured data for search engines: the organization, the site name and the two libraries.
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'IntelliNode',
      url: siteUrl,
      logo: `${siteUrl}/img/logo-dark.png`,
      sameAs: [
        'https://github.com/intelligentnode',
        'https://www.linkedin.com/company/intellinode-inc',
        'https://www.npmjs.com/package/intellinode',
        'https://pypi.org/project/intelli/',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'IntelliNode',
      url: siteUrl,
      description: siteDescription,
      inLanguage: 'en',
      publisher: {'@id': `${siteUrl}/#organization`},
    },
    {
      '@type': 'SoftwareSourceCode',
      name: 'Intelli',
      description: 'Open source Python framework for AI agents, multi-model flows, MCP and chatbots across OpenAI, Anthropic, Gemini and local models.',
      url: `${siteUrl}/docs/python`,
      codeRepository: 'https://github.com/intelligentnode/Intelli',
      programmingLanguage: 'Python',
      license: 'https://www.apache.org/licenses/LICENSE-2.0',
      publisher: {'@id': `${siteUrl}/#organization`},
    },
    {
      '@type': 'SoftwareSourceCode',
      name: 'IntelliNode',
      description: 'Open source Node.js library with one API for every AI model, tool calling, structured output, a coding agent and an MCP server.',
      url: `${siteUrl}/docs/npm`,
      codeRepository: 'https://github.com/intelligentnode/IntelliNode',
      programmingLanguage: 'JavaScript',
      runtimePlatform: 'Node.js',
      license: 'https://www.apache.org/licenses/LICENSE-2.0',
      publisher: {'@id': `${siteUrl}/#organization`},
    },
  ],
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  // used as the suffix of every page title: "<page> | IntelliNode"
  title: 'IntelliNode',
  tagline: 'Intellinode provides unified prompt, evaluation, and MCP integration to any large model.',
  favicon: 'img/favicon.ico',

  headTags: [
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', sizes: '180x180', href: '/img/apple-touch-icon.png'}},
    {tagName: 'script', attributes: {type: 'application/ld+json'}, innerHTML: JSON.stringify(structuredData)},
  ],
  
  // Set the production url of your site here
  url: siteUrl,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  staticDirectories: ['public', 'static'],

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'IntelliNode', // Usually your GitHub org/user name.
  projectName: 'Docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/intelligentnode/docs/edit/main/intellidocs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-PSSTWY93JY',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      colorMode: {
        defaultMode: "light",
        disableSwitch: true,
      },
      image: 'img/intellinode-social-card.png',
      metadata: [
        {name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1'},
        {name: 'author', content: 'IntelliNode'},
        {name: 'theme-color', content: '#2992FE'},
        {property: 'og:site_name', content: 'IntelliNode'},
        {property: 'og:type', content: 'website'},
        {property: 'og:image:width', content: '1200'},
        {property: 'og:image:height', content: '630'},
        {property: 'og:image:alt', content: 'IntelliNode, the open source AI framework for Python and Node.js'},
        {name: 'twitter:creator', content: '@BarqawiTechno'},
      ],
      navbar: {
        logo: {
          alt: 'Intelli Logo',
          src: 'img/logo-dark.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'pythonSidebar',
            position: 'left',
            label: 'Python',
          },
          {
            type: 'docSidebar',
            sidebarId: 'npmSidebar',
            label: 'NPM',
            position: 'left'
          },
          {
            href: 'https://github.com/intelligentnode/Intelli',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Python',
                to: '/docs/python/',
              },
              {
                label: 'NPM',
                to: '/docs/npm/',
              },
            ],
          },
          {
            title: 'More',
            items: [

              {
                label: 'GitHub',
                href: 'https://github.com/intelligentnode',
              },
              {
                label: 'Sport AI',
                // Tagged so Kickwise's analytics can count doc-footer referrals separately.
                href: 'https://kickwise.ai/?utm_source=intellinode&utm_medium=referral&utm_campaign=docs&utm_content=footer',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/VYgCh2p3Ww',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/company/intellinode-inc',
              },
              {
                html: '<a href="https://x.com/BarqawiTechno" target="_blank" rel="noopener noreferrer" class="footer__social-link" aria-label="Follow the developer on X"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg><span>@BarqawiTechno</span></a>',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} IntelliNode. All Rights Reserved.`,
      },
      prism: {
        theme: prismThemes.github,
      },
    }),
};

export default config;
