export function dailyStories(metas: any[], editions: Map<string, any>, date: string) {
  return metas.filter(meta => meta.date === date).flatMap(meta => (editions.get(meta.id)?.stories || []).map((story: any) => ({ ...story, editionId: meta.id }))).sort((a: any, b: any) => (b.updatedAt || b.publishedAt).localeCompare(a.updatedAt || a.publishedAt));
}

export function dailyDates(metas: any[]) {
  return [...new Set(metas.map(meta => meta.date))].sort((a, b) => b.localeCompare(a));
}
