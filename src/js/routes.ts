import { assetPath } from './paths';
export const articleUrl = (edition: string, article: string) => `${assetPath('article/')}?edition=${encodeURIComponent(edition)}&article=${encodeURIComponent(article)}`;
export const articleRoute = (search = location.search) => { const p = new URLSearchParams(search); const edition = p.get('edition'); const article = p.get('article'); return edition && article ? { edition, article } : null; };
