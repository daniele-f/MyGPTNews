import assert from 'node:assert/strict';
import test from 'node:test';
import { stageView } from '../src/js/home-view';
import { articleView } from '../src/js/article-view';
import { card } from '../src/js/render';

const story = { id: 'linked', editionId: 'edition', headline: 'Linked story', categories: ['Updates'], publishedAt: '2026-11-01T09:00:00Z', sourceUrl: 'https://example.test/source' };
const renderers = {
  stage: (summary: string) => stageView({ ...story, summary }, 'edition'),
  article: (summary: string) => articleView({ ...story, summary }, 'edition'),
  card: (summary: string) => card({ ...story, summary })
};
const links = (html: string) => [...html.matchAll(/<a class="inline-url" href="([^"]*)"[^>]*>([^<]*)<\/a>/g)].map(match => [match[1], match[2]]);

for (const [name, render] of Object.entries(renderers)) {
  test(`${name} makes the Steam URL in a summary clickable`, () => {
    const html = render('OpenCAGE is available at https://store.steampowered.com/app/3367530/ and requires Alien: Isolation.');
    assert.deepEqual(links(html), [['https://store.steampowered.com/app/3367530/', 'https://store.steampowered.com/app/3367530/']]);
    assert.match(html, /class="inline-url"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  });

  test(`${name} renders descriptive Markdown links without exposing their URLs`, () => {
    const html = render('OpenCAGE is available [on Steam](https://store.steampowered.com/app/3367530/) and requires Alien: Isolation.');
    assert.deepEqual(links(html), [['https://store.steampowered.com/app/3367530/', 'on Steam']]);
    assert.doesNotMatch(html, /\[on Steam\]\(/);
  });

  test(`${name} renders publisher bold tags and converts legacy Markdown bold`, () => {
    const html = render('The deal is <b>not agreed</b>, but **talks continue**.');
    assert.match(html, /The deal is <b>not agreed<\/b>, but <b>talks continue<\/b>\./);
    assert.doesNotMatch(html, /\*\*|&lt;b&gt;/);
  });

  test(`${name} escapes unsupported and unclosed HTML or Markdown markers`, () => {
    const html = render('Use <i>italics</i>, an unclosed <b>tag, and **literal markers.');
    assert.match(html, /Use &lt;i&gt;italics&lt;\/i&gt;, an unclosed &lt;b&gt;tag, and \*\*literal markers\./);
    assert.doesNotMatch(html, /<i>|<b>tag/);
  });

  test(`${name} keeps surrounding punctuation outside links and balanced parentheses in URLs`, () => {
    const html = render('See (https://example.test/wiki/Game_(series)). Also http://example.test/news!');
    assert.deepEqual(links(html), [
      ['https://example.test/wiki/Game_(series)', 'https://example.test/wiki/Game_(series)'],
      ['http://example.test/news', 'http://example.test/news']
    ]);
    assert.match(html, /Game_\(series\)<\/a>\)\./);
    assert.match(html, /news<\/a>!/);
  });

  test(`${name} preserves query parameters and escapes surrounding HTML`, () => {
    const html = render('<script>alert("x")</script> & details: https://example.test/?a=1&b=2.');
    assert.deepEqual(links(html), [['https://example.test/?a=1&amp;b=2', 'https://example.test/?a=1&amp;b=2']]);
    assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; &amp; details:/);
    assert.doesNotMatch(html, /<script>/);
  });

  test(`${name} does not turn non-web schemes or malformed URLs into links`, () => {
    const html = render('javascript:alert(1) data:text/html,<img> https:// http://');
    assert.deepEqual(links(html), []);
    assert.match(html, /&lt;img&gt;/);
  });

  test(`${name} cannot inject link attributes through quoted URL text`, () => {
    const html = render('https://example.test/path" onclick="alert(1)');
    assert.deepEqual(links(html), [['https://example.test/path', 'https://example.test/path']]);
    assert.doesNotMatch(html, /<a[^>]*onclick=/);
    assert.match(html, /<\/a>&quot; onclick=&quot;alert\(1\)/);
  });
}
