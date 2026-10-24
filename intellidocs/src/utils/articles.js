// Article content also renders on the articles tag, archive and author lists; this tells an
// article's own page (/articles/<slug>) apart from those.
const LIST_PAGES = new Set(['tags', 'page', 'archive', 'authors']);

export function isArticlePage(pathname) {
  const [section, slug] = pathname.split('/').filter(Boolean);
  return section === 'articles' && Boolean(slug) && !LIST_PAGES.has(slug);
}
