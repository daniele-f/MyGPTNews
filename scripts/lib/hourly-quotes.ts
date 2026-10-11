import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export type Quote = { text: string; author: string; sourceTitle: string; sourceUrl: string };
export type HourlyQuote = { id: string; slot: string; publishedAt: string; message: string; quote: Quote };
type QuoteHistory = { entries: HourlyQuote[] };

const quotes: Quote[] = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', sourceTitle: 'Stanford commencement address', sourceUrl: 'https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela', sourceTitle: 'Nelson Mandela Foundation quote collection', sourceUrl: 'https://www.nelsonmandela.org/content/page/selected-quotes' },
  { text: 'If you have good thoughts they will shine out of your face like sunbeams and you will always look lovely.', author: 'Roald Dahl', sourceTitle: 'The Twits', sourceUrl: 'https://www.roalddahl.com/roald-dahl/stories/quotes' },
  { text: 'No act of kindness, no matter how small, is ever wasted.', author: 'Aesop', sourceTitle: 'The Lion and the Mouse', sourceUrl: 'https://www.gutenberg.org/ebooks/28' }
];
const messages = ['A small thought for this hour.', 'A pause worth taking.', 'Something steady to carry forward.', 'One bright line for the next hour.'];

function brusselsParts(date: Date) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
    .formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
}

export function brusselsHourSlot(date: Date) {
  const parts = brusselsParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}`;
}

export function validateQuoteHistory(history: unknown): asserts history is QuoteHistory {
  if (!history || typeof history !== 'object' || !Array.isArray((history as QuoteHistory).entries)) throw new Error('Quote history is invalid.');
  const slots = new Set<string>();
  for (const entry of (history as QuoteHistory).entries) {
    if (!entry || typeof entry !== 'object' || !entry.slot || !entry.id || !entry.publishedAt || !entry.message || !entry.quote?.text || !entry.quote?.author || !entry.quote?.sourceUrl) throw new Error('Quote history contains an invalid entry.');
    if (slots.has(entry.slot)) throw new Error(`Quote history contains duplicate hour ${entry.slot}.`);
    slots.add(entry.slot);
  }
}

export async function readQuoteHistory(root = process.cwd()): Promise<QuoteHistory> {
  const file = join(root, 'data', 'hourly-quotes.json');
  try {
    const history = JSON.parse(await readFile(file, 'utf8'));
    validateQuoteHistory(history);
    return history;
  } catch (error: any) {
    if (error.code === 'ENOENT') return { entries: [] };
    throw error;
  }
}

export async function publishQuote(root = process.cwd(), now = new Date(), chooseQuote = () => quotes[Math.floor(Math.random() * quotes.length)], chooseMessage = () => messages[Math.floor(Math.random() * messages.length)]) {
  const history = await readQuoteHistory(root);
  const slot = brusselsHourSlot(now);
  if (history.entries.some((entry) => entry.slot === slot)) return { published: false, entry: history.entries.find((entry) => entry.slot === slot)! };
  const entry: HourlyQuote = { id: slot, slot, publishedAt: now.toISOString(), message: chooseMessage(), quote: chooseQuote() };
  history.entries.push(entry);
  history.entries.sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
  await mkdir(join(root, 'data'), { recursive: true });
  await writeFile(join(root, 'data', 'hourly-quotes.json'), `${JSON.stringify(history, null, 2)}\n`);
  return { published: true, entry };
}
