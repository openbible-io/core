import { test } from 'node:test';
import { fromEnglish, all } from './books.ts';

test('tricky books', t => {
	t.assert.equal('1sa', fromEnglish('1 Samuel'));
	t.assert.equal('est', fromEnglish('Esther'));
});
test('maps back to self', t => {
	Object.keys(all).forEach(p => t.assert.equal(p, fromEnglish(p)));
});
