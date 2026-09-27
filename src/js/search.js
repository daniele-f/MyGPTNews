const norm = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function searchStories(records, query = '', filters = {}) {
  const words = norm(query).split(' ').filter(Boolean);
  return records.filter((story) => {
    const text = norm([story.headline, story.summary, ...(story.subjects || []), story.developer, story.publisher, ...(story.categories || []), ...(story.platforms || []), ...(story.tags || []), story.sourceName].join(' '));
    return words.every((word) => text.includes(word)) && (!filters.game || story.subjects.includes(filters.game)) && (!filters.platform || story.platforms.includes(filters.platform)) && (!filters.category || story.categories.includes(filters.category)) && (!filters.source || story.sourceName === filters.source) && (!filters.from || story.editionDate >= filters.from) && (!filters.to || story.editionDate <= filters.to);
  });
}
