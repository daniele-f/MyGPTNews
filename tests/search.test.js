import assert from 'node:assert/strict'; import test from 'node:test'; import { searchStories } from '../src/js/search.js';
const records = [{ id:'a',editionDate:'2026-09-26',headline:'Orbital News',summary:'',subjects:['Orbital'],developer:'Northstar',publisher:'Northstar',categories:['Update'],platforms:['PC'],tags:[],sourceName:'Northstar Studio' }];
test('finds a game without case sensitivity',()=>assert.deepEqual(searchStories(records,'ORBITAL',{}).map(x=>x.id),['a']));
test('returns all records for empty query',()=>assert.equal(searchStories(records,'',{}).length,1));
