export function resolveDayRoute(search: string, editions: { id: string; date: string }[]) {
  const params = new URLSearchParams(search);
  const editionId = params.get('edition');
  const articleId = params.get('article');
  if (editionId && articleId) return editions.find(edition => edition.id === editionId)?.date || null;
  const date = params.get('date');
  if (date) return editions.some(edition => edition.date === date) ? date : null;
  return editions[0]?.date || null;
}
