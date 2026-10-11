export type HourlyQuoteEntry = { id: string; slot: string; publishedAt: string; message: string; quote: { text: string; author: string; sourceTitle: string; sourceUrl: string } };

export function quoteView(entries: HourlyQuoteEntry[], requestedId?: string | null) {
  const ordered = [...entries].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
  const selectedIndex = Math.max(0, ordered.findIndex((entry) => entry.id === requestedId));
  const selected = ordered[selectedIndex];
  return { selected, newer: selectedIndex > 0 ? ordered[selectedIndex - 1] : undefined, older: ordered[selectedIndex + 1], timeline: ordered.filter((entry) => entry.slot.slice(0, 10) === selected.slot.slice(0, 10)), dates: [...new Set(ordered.map((entry) => entry.slot.slice(0, 10)))], selectedUrl: `?entry=${encodeURIComponent(selected.id)}` };
}

export function selectionTarget(entries: HourlyQuoteEntry[], date: string, time: string) {
  return entries.find((entry) => entry.slot === `${date}T${time}`) ?? entries.find((entry) => entry.slot.startsWith(`${date}T`));
}
