import { normalizeUrl } from './url.js';

const REQUIRED = ['id', 'editionDate', 'headline', 'summary', 'subjects', 'developer', 'publisher', 'categories', 'platforms', 'tags', 'sourceName', 'sourceUrl', 'imageUrl', 'publishedAt', 'discoveredAt', 'featured', 'relatedStoryIds'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validateEdition(edition) {
  const errors = [];
  if (!edition || !DATE.test(edition.date || '')) errors.push('Edition date must be YYYY-MM-DD.');
  if (!edition?.updatedAt || Number.isNaN(Date.parse(edition.updatedAt))) errors.push('Edition updatedAt must be a date-time.');
  if (!Array.isArray(edition?.stories) || edition.stories.length === 0) errors.push('Edition needs at least one story.');
  const ids = new Set(); const urls = new Set(); let featured = 0;
  for (const [index, item] of (edition?.stories || []).entries()) {
    for (const field of REQUIRED) if (item?.[field] === undefined || item[field] === '') errors.push(`Story ${index + 1} is missing ${field}.`);
    if (item?.editionDate !== edition?.date) errors.push(`Story ${item?.id || index + 1} has a mismatched edition date.`);
    if (ids.has(item?.id)) errors.push(`Duplicate story id: ${item?.id}.`); ids.add(item?.id);
    try { const url = normalizeUrl(item?.sourceUrl); if (urls.has(url)) errors.push(`Duplicate normalized source URL: ${url}.`); urls.add(url); } catch { errors.push(`Story ${item?.id || index + 1} has an invalid source URL.`); }
    if (!Array.isArray(item?.subjects) || !Array.isArray(item?.categories) || !Array.isArray(item?.platforms) || !Array.isArray(item?.tags) || !Array.isArray(item?.relatedStoryIds)) errors.push(`Story ${item?.id || index + 1} has invalid tag fields.`);
    if (item?.featured) featured += 1;
  }
  if (featured > 1) errors.push('Only one featured story is allowed per edition.');
  return { valid: errors.length === 0, errors };
}
