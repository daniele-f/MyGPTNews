import assert from 'node:assert/strict';
import test from 'node:test';
import { brandButton, gamePage } from '../src/js/game-link';

test('uses the bundled Steam logo instead of the logo API', () => {
  const story = { game:{ name:'Example', id:'example', url:'https://example.com/game' }, steam:{ url:'https://store.steampowered.com/app/123/' } };
  assert.deepEqual(gamePage(story), { url:'https://store.steampowered.com/app/123/', domain:'steampowered.com', label:'Steam' });
  const button = brandButton(story, 'public-token');
  assert.match(button, /src="\/steam-logo\.ico"/);
  assert.doesNotMatch(button, /img\.logo\.dev/);
});

test('uses a verified non-Steam game page when Steam is unavailable', () => {
  const story = { game:{ name:'World of Warcraft', id:'world-of-warcraft', url:'https://worldofwarcraft.blizzard.com/' } };
  assert.deepEqual(gamePage(story), { url:'https://worldofwarcraft.blizzard.com/', domain:'worldofwarcraft.blizzard.com', label:'World of Warcraft' });
  assert.match(brandButton(story, 'public-token'), /img\.logo\.dev\/worldofwarcraft\.blizzard\.com\?token=public-token/);
});
