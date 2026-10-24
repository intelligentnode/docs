/**
 * Puts the newsletter form after each article's intro: right before its first ## heading, so
 * every article, new ones included, gets it without an edit. The form is the NewsletterInline
 * MDX component (src/theme/MDXComponents.js). Articles keep their <!-- truncate --> marker above
 * the first heading, so article lists, which show only the part above the marker, never show it.
 */
export default function remarkNewsletterInline() {
  return (tree) => {
    const index = tree.children.findIndex((node) => node.type === 'heading' && node.depth === 2);
    if (index === -1) return;
    tree.children.splice(index, 0, {
      type: 'mdxJsxFlowElement',
      name: 'NewsletterInline',
      attributes: [],
      children: [],
    });
  };
}
