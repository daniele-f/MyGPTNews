const read = (key: string) => { try { return new Set<string>(JSON.parse(localStorage.getItem(key) || '[]')); } catch { return new Set<string>(); } };
const save = (key: string, values: Set<string>) => { try { localStorage.setItem(key, JSON.stringify([...values])); } catch {} };
const toggle = (key: string, value: string) => { const values = read(key); values.has(value) ? values.delete(value) : values.add(value); save(key, values); return values; };
export const favorites = () => read('mygptnews.favorites.v1'); export const toggleFavorite = (id: string) => toggle('mygptnews.favorites.v1', id);
export const readArticles = () => read('mygptnews.read.v1'); export const markRead = (id: string) => { const values = readArticles(); values.add(id); save('mygptnews.read.v1', values); return values; };
