import { prepareEditions } from './lib/indexes';

try { await prepareEditions(process.cwd()); console.log('Edition data is valid and indexes are ready.'); }
catch (error) { console.error(error.message); process.exitCode = 1; }
