/**
 * Writes /llms.txt (https://llmstxt.org) at build time, so coding agents such as
 * Claude Code, Codex or Cursor can find every docs page and article with a one line
 * description. It follows the sidebar order and is regenerated on every build, so it
 * never goes stale.
 */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const INTRO = `# IntelliNode

> Open source AI framework with two libraries: Intelli for Python (pip install intelli) and IntelliNode for Node.js (npm i intellinode). One API for OpenAI, Anthropic, Gemini, Mistral and local models (Ollama, vLLM, llama.cpp), plus flows and graphs of agents, Vibe Agents that build a flow from a plain language intent, tool calling, structured output, MCP and coding agents.

Use these pages to write code with the libraries. Python examples import from \`intelli\` and Node.js examples require \`intellinode\`. Each link opens the full page; the text after the colon says what the page covers.
`;

function frontMatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  const data = {};
  if (!match) return data;
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (/^".*"$/.test(value) || /^'.*'$/.test(value)) value = value.slice(1, -1);
    data[kv[1]] = value;
  }
  return data;
}

// Pages that do not help anyone write code: a discontinued service and download statistics.
const SKIP = new Set(['npm/intellicloud', 'python/downloads']);

function docEntry(siteDir, siteUrl, id) {
  if (SKIP.has(id)) return null;
  const base = path.join(siteDir, 'docs', id);
  const file = ['.md', '.mdx'].map((ext) => base + ext).find((candidate) => fs.existsSync(candidate));
  if (!file) return null;
  const fm = frontMatter(file);
  let route;
  if (fm.slug) route = `/docs${fm.slug.startsWith('/') ? '' : '/'}${fm.slug}`;
  else if (id.endsWith('/index')) route = `/docs/${id.slice(0, -'index'.length)}`;
  else route = `/docs/${id}`;
  return {title: fm.title || fm.sidebar_label || id, description: fm.description || '', url: siteUrl + route};
}

function line(entry) {
  return `- [${entry.title}](${entry.url})${entry.description ? `: ${entry.description}` : ''}`;
}

function sidebarSections(siteDir, siteUrl, items, prefix) {
  const sections = [];
  const loose = [];
  for (const item of items) {
    if (typeof item === 'string' || item.type === 'doc') {
      const entry = docEntry(siteDir, siteUrl, typeof item === 'string' ? item : item.id);
      if (entry) loose.push(entry);
    } else if (item.type === 'category') {
      const entries = [];
      if (item.link?.type === 'doc') entries.push(docEntry(siteDir, siteUrl, item.link.id));
      for (const child of item.items) {
        if (typeof child === 'string' || child.type === 'doc') {
          entries.push(docEntry(siteDir, siteUrl, typeof child === 'string' ? child : child.id));
        }
      }
      sections.push({heading: `${prefix}: ${item.label}`, entries: entries.filter(Boolean)});
    }
  }
  if (loose.length) sections.unshift({heading: prefix, entries: loose});
  return sections;
}

function articleEntries(siteDir, siteUrl) {
  const dir = path.join(siteDir, 'blog');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /\.mdx?$/.test(name))
    .map((name) => ({name, fm: frontMatter(path.join(dir, name))}))
    .filter(({fm}) => fm.slug && fm.title)
    .sort((a, b) => (b.fm.date || b.name).localeCompare(a.fm.date || a.name))
    .map(({fm}) => ({title: fm.title, description: fm.description || '', url: `${siteUrl}/articles/${fm.slug}`}));
}

export default function llmsTxtPlugin(context) {
  return {
    name: 'llms-txt',
    async postBuild({outDir}) {
      const {siteDir, siteConfig} = context;
      const siteUrl = siteConfig.url.replace(/\/$/, '');
      const sidebars = (await import(pathToFileURL(path.join(siteDir, 'sidebars.js')).href)).default;
      const sections = [
        ...sidebarSections(siteDir, siteUrl, sidebars.pythonSidebar, 'Intelli for Python'),
        ...sidebarSections(siteDir, siteUrl, sidebars.npmSidebar, 'IntelliNode for Node.js'),
        {heading: 'Articles', entries: articleEntries(siteDir, siteUrl)},
        {
          heading: 'Agent kit',
          entries: [
            {title: 'AGENTS.md section for Intelli', url: `${siteUrl}/agent-kit/AGENTS.md`, description: 'Rules that teach a coding agent to build Intelli flows and Vibe Agents. Add it to the AGENTS.md of a project.'},
            {title: 'intelli-flows skill', url: `${siteUrl}/agent-kit/SKILL.md`, description: 'A SKILL.md for Claude Code and Codex: write the flow, run it, draw its picture and explain it in plain language.'},
          ],
        },
      ].filter((section) => section.entries.length);
      const body = sections.map((s) => `## ${s.heading}\n\n${s.entries.map(line).join('\n')}`).join('\n\n');
      fs.writeFileSync(path.join(outDir, 'llms.txt'), `${INTRO}\n${body}\n`);
    },
  };
}
