// Submit site URLs to IndexNow (Bing, Yandex, Naver, Seznam, Yep share submissions).
//
//   npm run indexnow                      every URL in the live sitemap
//   npm run indexnow -- --dry-run         list what would be sent
//   npm run indexnow -- /articles/x       only these paths or full URLs
//
// The key is public by design: it lives in static/<key>.txt and is served at the site root,
// which is how the search engines confirm that the submission comes from the site owner.
// Run it after a deploy is live, so the engines can fetch the key file and the new pages.

import {readdirSync, readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SITE = 'https://www.intellinode.ai';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10000;

const staticDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'static');
const keyFile = readdirSync(staticDir).find((name) => /^[a-f0-9]{32}\.txt$/.test(name));
if (!keyFile) {
  console.error(`No IndexNow key file found in ${staticDir}`);
  process.exit(1);
}
const key = readFileSync(join(staticDir, keyFile), 'utf8').trim();
const keyLocation = `${SITE}/${keyFile}`;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const requested = args.filter((arg) => !arg.startsWith('--'));

async function sitemapUrls() {
  const response = await fetch(`${SITE}/sitemap.xml`);
  if (!response.ok) throw new Error(`sitemap.xml returned ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

const urls = requested.length
  ? requested.map((value) => (value.startsWith('http') ? value : `${SITE}${value.startsWith('/') ? '' : '/'}${value}`))
  : await sitemapUrls();

const host = new URL(SITE).host;
const foreign = urls.filter((url) => new URL(url).host !== host);
if (foreign.length) {
  console.error(`These URLs are not on ${host}:\n${foreign.join('\n')}`);
  process.exit(1);
}

const keyCheck = await fetch(keyLocation);
const liveKey = keyCheck.ok ? (await keyCheck.text()).trim() : null;
if (liveKey !== key) {
  console.error(`The key file is not live yet at ${keyLocation} (status ${keyCheck.status}). Deploy first, then run again.`);
  process.exit(1);
}

console.log(`${urls.length} URLs for ${host}, key file ${keyLocation}`);
if (dryRun) {
  console.log(urls.join('\n'));
  process.exit(0);
}

const MEANING = {
  200: 'accepted',
  202: 'received, key validation pending',
  400: 'invalid format',
  403: 'key not valid or key file missing',
  422: 'URLs do not match the host or the key',
  429: 'too many requests, try again later',
};

for (let start = 0; start < urls.length; start += MAX_URLS) {
  const urlList = urls.slice(start, start + MAX_URLS);
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json; charset=utf-8'},
    body: JSON.stringify({host, key, keyLocation, urlList}),
  });
  const body = (await response.text()).trim();
  console.log(`IndexNow ${response.status} (${MEANING[response.status] ?? 'unexpected'}) for ${urlList.length} URLs${body ? `: ${body}` : ''}`);
  if (response.status >= 400) process.exitCode = 1;
}
