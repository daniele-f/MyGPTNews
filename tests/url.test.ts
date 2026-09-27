import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeUrl } from '../scripts/lib/url';

test('normalizes tracking variants of the same article URL', () => {
  assert.equal(
    normalizeUrl('HTTPS://Example.test/news/?utm_source=x#top'),
    'https://example.test/news'
  );
});
