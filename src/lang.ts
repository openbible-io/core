/**
 * Superset of possible languages. Smile when you add another!
 *
 * iso639-2 codes: https://www.loc.gov/standards/iso639-2/php/code_list.php
 */
export const langs = [
	'eng',
	'spa',
	'heb',
	'grc',
] as const;
export type Lang = typeof langs[number];
