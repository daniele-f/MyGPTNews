const dayOffset = (date: string, offset: number) => {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + offset));
  return value.toISOString().slice(0, 10);
};

const longSummary = 'This deliberately extended development briefing makes the story stage long enough to exercise its independent scroll behavior, sticky divider, and surrounding layout without relying on published archive content. '.repeat(18).trim();
const shortSummary = 'A short development briefing for compact-stage testing.';

const storiesFor = (date: string, count: number, summary: string) => Array.from({ length: count }, (_, index) => ({
  id: `dev-${date}-${index + 1}`,
  headline: `Development fixture story ${index + 1}`,
  summary: index === 0 ? summary : shortSummary,
  categories: ['Development'],
  publishedAt: `${date}T${String(23 - (index % 20)).padStart(2, '0')}:00:00Z`,
  featured: index === 0,
  sourceUrl: `https://example.test/development/${date}/${index + 1}`
}));

export function developmentFixtures(today: string) {
  const scenarios = [
    { count: 20, summary: longSummary },
    { count: 20, summary: shortSummary },
    { count: 2, summary: longSummary },
    { count: 2, summary: shortSummary }
  ];
  const editions = new Map<string, any>();
  const archive = { editions: scenarios.map((scenario, index) => {
    const date = dayOffset(today, -index);
    const id = `dev-${date}`;
    const publishedAt = `${date}T12:00:00Z`;
    editions.set(id, { stories: storiesFor(date, scenario.count, scenario.summary) });
    return { id, date, publishedAt, updatedAt: publishedAt, path: '' };
  }) };
  return { archive, editions };
}
