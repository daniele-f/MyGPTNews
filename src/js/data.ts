import { assetPath } from './paths';
export async function loadJson(path) { const response = await fetch(assetPath(path)); if (!response.ok) throw new Error(`Could not load ${path}.`); return response.json(); }
