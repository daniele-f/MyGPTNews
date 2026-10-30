import { normalizeUrl } from './url';

export const CATEGORIES = ['Releases', 'Announcements', 'Updates', 'Industry News', 'Deals & Events'];
const TIMESTAMP_FILE = /^(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z)\.json$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value));

export function parseEditionFilename(name: string) {
  const match = name.match(TIMESTAMP_FILE);
  return match ? match[1].replace(/(T\d{2})-(\d{2})-(\d{2}Z)$/, '$1:$2:$3') : null;
}

export function brusselsDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function validateEdition(edition: any, expectedId?: string) {
  const errors: string[] = [];
  if (!edition || typeof edition !== 'object') return { valid: false, errors: ['Edition must be an object.'] };
  if (typeof edition.id !== 'string' || !isDate(edition.id)) errors.push('Edition id must be an ISO date-time.');
  if (expectedId && edition.id !== expectedId) errors.push('Edition id must match its timestamped filename.');
  if (!DATE.test(edition.date || '')) errors.push('Edition date must be YYYY-MM-DD.');
  if (!isDate(edition.publishedAt)) errors.push('Edition publishedAt must be a date-time.');
  if (!isDate(edition.updatedAt)) errors.push('Edition updatedAt must be a date-time.');
  if (isDate(edition.publishedAt) && edition.date !== brusselsDate(edition.publishedAt)) errors.push('Edition date must match publishedAt in Europe/Brussels.');
  if (!Array.isArray(edition.stories) || edition.stories.length === 0) errors.push('Edition needs at least one story.');
  const ids = new Set<string>(); const urls = new Set<string>(); let featured = 0;
  for (const [index, story] of (edition.stories || []).entries()) {
    const label = `Story ${story?.id || index + 1}`;
    for (const field of ['id', 'headline', 'summary', 'sourceUrl', 'publishedAt']) if (typeof story?.[field] !== 'string' || !story[field].trim()) errors.push(`${label} is missing ${field}.`);
    if (!Array.isArray(story?.categories) || !story.categories.length || story.categories.some((category: string) => !CATEGORIES.includes(category))) errors.push(`${label} has invalid categories.`);
    if (typeof story?.featured !== 'boolean') errors.push(`${label} needs a boolean featured value.`);
    if (!isDate(story?.publishedAt)) errors.push(`${label} has an invalid publishedAt.`);
    if (story?.changeType && !['new', 'updated'].includes(story.changeType)) errors.push(`${label} has an invalid changeType.`);
    if (story?.changeType && !isDate(story?.updatedAt)) errors.push(`${label} needs an updatedAt timestamp for its changeType.`);
    if (story?.game && (typeof story.game.name !== 'string' || typeof story.game.id !== 'string')) errors.push(`${label} game needs name and id.`);
    for (const [field, value] of [['image URL', story?.imageUrl], ['Steam URL', story?.steam?.url], ['game page URL', story?.game?.url]] as const) if (value) try { normalizeUrl(value); } catch { errors.push(`${label} has an invalid ${field}.`); }
    if (story?.steam?.releaseDate && !isDate(story.steam.releaseDate)) errors.push(`${label} has an invalid Steam release date.`);
    if (story?.price && (!isDate(story.price.checkedAt) || typeof story.price.amount !== 'number')) errors.push(`${label} has an invalid price observation.`);
    if (story?.relatedArticleIds && !Array.isArray(story.relatedArticleIds)) errors.push(`${label} has invalid relatedArticleIds.`);
    if (ids.has(story?.id)) errors.push(`Duplicate story id: ${story?.id}.`); ids.add(story?.id);
    try { const url = normalizeUrl(story?.sourceUrl); if (urls.has(url)) errors.push(`Duplicate normalized source URL: ${url}.`); urls.add(url); } catch { errors.push(`${label} has an invalid source URL.`); }
    if (story?.featured) featured += 1;
  }
  if (featured > 1) errors.push('Only one featured story is allowed per edition.');
  return { valid: errors.length === 0, errors };
}
