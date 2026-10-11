import { publishQuote } from './lib/hourly-quotes';

try {
  const result = await publishQuote();
  console.log(result.published ? `Published quote for ${result.entry.slot}.` : `A quote already exists for ${result.entry.slot}; nothing changed.`);
} catch (error: any) {
  console.error(error.message);
  process.exitCode = 1;
}
