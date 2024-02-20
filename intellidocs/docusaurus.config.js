// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Open Source AI Framework',
  tagline: 'Intellinode provides unified prompt, evaluation, and production integration to any large model.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.intellinode.ai',
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
      image: 'img/docusaurus-social-card.jpg',
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
            href: 'https://intellinode.ai/getting-started',
            label: 'Get started',
            position: 'right',
          },
          {
            href: 'https://show.intellinode.ai',
            label: 'Showcase',
            position: 'right',
          },
          {
            href: 'https://intellinode.ai/#form-register',
            label: 'Register',
            position: 'right',
          },
          {
            href: 'https://github.com/intelligentnode',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        logo: {
          alt: 'Intelli Logo',
          src: 'img/logo-light.png',
        },
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Python',
                to: '/docs/python/get-started/introduction',
              },
              {
                label: 'NPM',
                to: '/docs/npm/get-started/introduction',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Articles',
                to: 'https://intellinode.ai/articles',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/intelligentnode',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/intellinode',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/intellinode',
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
