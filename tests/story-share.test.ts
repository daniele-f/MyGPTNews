import assert from 'node:assert/strict';
import test from 'node:test';
import { storyShareDetails } from '../src/js/story-share';

test('shares the exact article permalink from a search page on GitHub Pages', () => {
  const path = '/MyGPTNews/article/?edition=2026-11-10T09%3A06%3A15Z&article=phasmophobia';
  const title = 'Ghosts & rewards? #Phasmophobia';
  const expected = 'https://daniele-f.github.io/MyGPTNews/article/?edition=2026-11-10T09%3A06%3A15Z&article=phasmophobia';
  const details = storyShareDetails(path, title, 'https://daniele-f.github.io/MyGPTNews/search/?q=ghosts');

  assert.equal(details.url, expected);
  const email = new URL(details.email);
  assert.equal(email.protocol, 'mailto:');
  assert.equal(email.searchParams.get('subject'), title);
  assert.equal(email.searchParams.get('body'), 'Hey friend\r\n\r\n' + expected + '\r\n\r\ncheck this out');
  const whatsapp = new URL(details.whatsapp);
  assert.equal(whatsapp.origin, 'https://wa.me');
  assert.equal(whatsapp.searchParams.get('text'), title + '\n' + expected);
  const reddit = new URL(details.reddit);
  assert.equal(reddit.origin + reddit.pathname, 'https://www.reddit.com/submit');
  assert.equal(reddit.searchParams.get('type'), 'LINK');
  assert.equal(reddit.searchParams.get('url'), expected);
  assert.equal(reddit.searchParams.get('title'), title);
});
