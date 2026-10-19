/**
 * Gives the home page its "Recent guides" list: the newest articles in the blog folder,
 * read on every build, so the list never goes stale and needs no hand edits.
 * The page reads them with usePluginData('recent-guides').
 */
import fs from 'node:fs';
import path from 'node:path';
import {frontMatter} from './llms-txt.js';

const COUNT = 3;

// "2026-10-19" -> "Oct 19", in UTC so the build machine's time zone never shifts the day.
function shortDate(isoDay) {
  return new Date(`${isoDay}T00:00:00Z`).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'});
}

export default function recentGuidesPlugin(context) {
  const dir = path.join(context.siteDir, 'blog');
  return {
    name: 'recent-guides',
    getPathsToWatch() {
      return [path.join(dir, '*.{md,mdx}')];
    },
    async loadContent() {
      if (!fs.existsSync(dir)) return [];
      return fs
        .readdirSync(dir)
        .filter((name) => /\.mdx?$/.test(name))
        .map((name) => ({name, fm: frontMatter(path.join(dir, name))}))
        .filter(({fm}) => fm.slug && fm.title && fm.draft !== 'true' && fm.unlisted !== 'true')
        .sort((a, b) => (b.fm.date || b.name).localeCompare(a.fm.date || a.name))
        .slice(0, COUNT)
        .map(({name, fm}) => {
          const day = (fm.date || name).slice(0, 10);
          return {title: fm.title, permalink: `/articles/${fm.slug}`, date: day, label: shortDate(day)};
        });
    },
    async contentLoaded({content, actions}) {
      actions.setGlobalData({guides: content});
    },
  };
}
