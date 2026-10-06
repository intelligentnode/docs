/**
 * The 404 page. Some links to the site arrive with punctuation from the surrounding text stuck to the end,
 * such as /docs/python). when a tool copies a Markdown link. When trimming that punctuation leaves a
 * different path, send the visitor there. Otherwise show the normal 404 page.
 */
import React, {useEffect} from 'react';
import Content from '@theme-original/NotFound/Content';

const TRAILING_PUNCTUATION = /(?:[).,;:!'"\]>]|%29|%22|%27)+$/;

export default function NotFoundContentWrapper(props) {
  useEffect(() => {
    const {pathname, search, hash} = window.location;
    const cleaned = pathname.replace(TRAILING_PUNCTUATION, '');
    if (cleaned && cleaned !== pathname) {
      window.location.replace(cleaned + search + hash);
    }
  }, []);
  return <Content {...props} />;
}
