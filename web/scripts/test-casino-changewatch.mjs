import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { watchEntries, pendingOperators } from '../lib/casino-changewatch.ts';
const ids = new Set();
const slugs = new Set(JSON.parse(readFileSync(new URL('../data/ops.json',import.meta.url),'utf8')).map(o=>o.slug));
for (const e of watchEntries) {
 assert.ok(slugs.has(e.operatorSlug));
 assert.ok(!ids.has(e.id)); ids.add(e.id);
 assert.ok(['verification','withdrawals','offers'].includes(e.category));
 assert.equal(new URL(e.source.url).protocol,'https:');
 assert.match(e.source.checkedDate,/^\d{4}-\d{2}-\d{2}$/);
 assert.ok(e.current.trim());
 if(e.kind === 'baseline') {assert.equal(e.previousValue,null);assert.equal(e.changedAt,null);assert.equal(e.observedAt,e.source.checkedDate);}
 else {assert.ok(e.previous.trim());assert.ok(e.previousSource.excerpt.trim());assert.ok(e.source.excerpt.trim());}
}
assert.equal(watchEntries.filter(e=>e.kind==='change').length,0);
for(const op of pendingOperators) {
 assert.ok(slugs.has(op.operatorSlug));
 assert.equal(op.status,'terms-pending');
 assert.ok(!watchEntries.some(e=>e.operatorSlug===op.operatorSlug));
 assert.equal(new URL(op.guidanceUrl).protocol,'https:');
}
assert.equal(watchEntries.length,12);
assert.equal(new Set(watchEntries.map(e=>e.operatorSlug)).size,6);
assert.equal(pendingOperators.length,1);
console.log('ChangeWatch: 12 sourced baselines / 6 operators / 1 pending / 0 invented changes');
