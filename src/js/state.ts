const read = (key: string) => { try { return new Set<string>(JSON.parse(localStorage.getItem(key) || '[]')); } catch { return new Set<string>(); } };
const save = (key: string, values: Set<string>) => { try { localStorage.setItem(key, JSON.stringify([...values])); } catch {} };
const toggle = (key: string, value: string) => { const values = read(key); values.has(value) ? values.delete(value) : values.add(value); save(key, values); return values; };
export const favorites = () => read('mygptnews.favorites.v1'); export const toggleFavorite = (id: string) => toggle('mygptnews.favorites.v1', id);
export const readArticles = () => read('mygptnews.read.v1'); export const markRead = (id: string) => { const values = readArticles(); values.add(id); save('mygptnews.read.v1', values); return values; };
const selectedStoryKey = 'mygptnews.selected-story.v1';
export const storedStoryForDay = (value: string | null, date: string) => { try { const selection = JSON.parse(value || 'null'); return selection?.date === date && typeof selection.storyId === 'string' ? selection.storyId : null; } catch { return null; } };
export const selectedStoryForDay = (date: string) => { try { return storedStoryForDay(localStorage.getItem(selectedStoryKey), date); } catch { return null; } };
export const rememberSelectedStory = (date: string, storyId: string) => { try { localStorage.setItem(selectedStoryKey, JSON.stringify({ date, storyId })); } catch {} };

const swipeHintKey = 'mygptnews.swipe-hint-dismissed.v1';
export const swipeHintDismissed = () => { try { return localStorage.getItem(swipeHintKey) === 'true'; } catch { return false; } };
export const dismissSwipeHint = () => { try { localStorage.setItem(swipeHintKey, 'true'); } catch {} };
