import { equal } from 'node:assert';
import { fromEnglish } from './books.ts';

equal(fromEnglish('1 Samuel'), '1sa');
