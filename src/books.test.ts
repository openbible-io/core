import { equal } from 'node:assert';
import { fromEnglish, protestant } from './books.ts';

equal('1sa', fromEnglish('1 Samuel'));
equal('est', fromEnglish('Esther'));
protestant.forEach(p => equal(p, fromEnglish(p)));
