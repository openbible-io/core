import { equal } from 'node:assert';
import { fromEnglish, all } from './books.ts';

equal('1sa', fromEnglish('1 Samuel'));
equal('est', fromEnglish('Esther'));
Object.keys(all).forEach(p => equal(p, fromEnglish(p)));
