// https://www.biblegateway.com/learn/bible-101/about-the-bible/when-was-the-bible-written/
// TODO: https://www.biblegateway.com/learn/bible-101/who-wrote-the-bible/
export const all = {
	'gen': { from: '-1446', to: '-1406' },
	'exo': { from: '-1446', to: '-1406' },
	'lev': { from: '-1446', to: '-1406' },
	'num': { from: '-1446', to: '-1406' },
	'deu': { from: '-1446', to: '-1406' },
	'jos': { from: '-1400', to: '-1370' },
	'jdg': { from: '-1045', to: '-1000' },
	'rut': { from: '-1011', to: '-931' },
	'1sa': { from: '-930', to: '-722' },
	'2sa': { from: '-930', to: '-722' },
	'1ki': { from: '-560', to: '-540' },
	'2ki': { from: '-560', to: '-540' },
	'1ch': { from: '-450', to: '-425' },
	'2ch': { from: '-450', to: '-425' },
	'ezr': { from: '-440', to: '-430' },
	'neh': { from: '-430', to: '-400' },
	'est': { from: '-400' },
	'job': { from: '-1000', to: '-500' },
	'psa': { from: '-1400', to: '-500' },
	'pro': { from: '-950', to: '-700' },
	'ecc': { from: '-935' },
	'sng': { from: '-960', to: '-931' },
	'isa': { from: '-700', to: '-681' },
	'jer': { from: '-626', to: '-585' },
	'lam': { from: '-586' },
	'ezk': { from: '-593', to: '-571' },
	'dan': { from: '-530' },
	'hos': { from: '-750', to: '-715' },
	'jol': { from: '-500', to: '-450' },
	'amo': { from: '-760', to: '-750' },
	'oba': { from: '-580', to: '-560' },
	'jon': { from: '-790', to: '-760' },
	'mic': { from: '-735', to: '-700' },
	'nam': { from: '-663', to: '-612' },
	'hab': { from: '-612', to: '-589' },
	'zep': { from: '-640', to: '-609' },
	'hag': { from: '-520' },
	'zec': { from: '-520', to: '-480' },
	'mal': { from: '-440', to: '-430' },
	'mat': { from: '70' },
	'mrk': { from: '64', to: '70' },
	'luk': { from: '62', to: '90' },
	'jhn': { from: '90', to: '110' },
	'act': { from: '62', to: '90' },
	'rom': { from: '56', to: '57' },
	'1co': { from: '53', to: '54' },
	'2co': { from: '55', to: '56' },
	'gal': { from: '50', to: '56' },
	'eph': { from: '60', to: '62' },
	'php': { from: '54', to: '62' },
	'col': { from: '57', to: '62' },
	'1th': { from: '50', to: '51' },
	'2th': { from: '51', to: '52' },
	'1ti': { from: '62', to: '64' },
	'2ti': { from: '64', to: '67' },
	'tit': { from: '62', to: '64' },
	'phm': { from: '54', to: '62' },
	'heb': { from: '60', to: '95' },
	'jas': { from: '45', to: '62' },
	'1pe': { from: '60', to: '65' },
	'2pe': { from: '65', to: '68' },
	'1jn': { from: '85', to: '100' },
	'2jn': { from: '85', to: '100' },
	'3jn': { from: '85', to: '100' },
	'jud': { from: '65', to: '80' },
	'rev': { from: '64', to: '65' },
	'tob': {},
	'jdt': {},
	'esg': {},
	'wis': {},
	'sir': {},
	'bar': {},
	'lje': {},
	's3y': {},
	'sus': {},
	'bel': {},
	'1ma': {},
	'2ma': {},
	'3ma': {},
	'4ma': {},
	'1es': {},
	'2es': {},
	'man': {},
	'ps2': {},
	'oda': {},
	'pss': {},
	'eza': {},
	'5ez': {},
	'6ez': {},
	'dag': {},
	'ps3': {},
	'2ba': {},
	'lba': {},
	'jub': {},
	'eno': {},
	'1mq': {},
	'2mq': {},
	'3mq': {},
	'rep': {},
	'4ba': {},
	'lao': {},
} as const;

/**
* Paratext ID
* https://ubsicap.github.io/usfm/identification/books.html)
*/
export type Book = keyof typeof all;

/**
 * Eagerly match an English book name to an ID.
 *
 * @param {string} eng english book name
 */
export function fromEnglish(eng: string): Book {
	eng = eng.toLowerCase();
	const numeric = eng.replace(/\b(the|book|letter|of|Paul|to)\b|-/g, '');
	const norm = numeric
		.replace(/[0-9]|\b(ii|iii|iv|v|vi|first|second|third|fourth|fifth|sixth)\b/g, '')
		.replace(/\s+/g, '')

	const found = (Object.keys(all) as Book[]).find(b => b == numeric);
	if (found) return found;

	if (norm.startsWith('gen')) return 'gen';
	if (norm.startsWith('exo')) return 'exo';
	if (norm.startsWith('lev')) return 'lev';
	if (norm.startsWith('num')) return 'num';
	if (norm.startsWith('deu')) return 'deu';
	if (norm.startsWith('jos')) return 'jos';
	if (norm.startsWith('judg')) return 'jdg';
	if (norm.startsWith('rut')) return 'rut';
	if (norm.startsWith('sa')) {
		if (includesNumber(numeric, 2)) return '2sa';
		return '1sa';
	}
	if (norm.startsWith('ki') || norm.startsWith('kg')) {
		if (includesNumber(numeric, 4)) return '2ch';
		if (includesNumber(numeric, 3)) return '1ch';
		if (includesNumber(numeric, 2)) return '2ki';
		return '1ki';
	}
	if (norm.startsWith('ch')) {
		if (includesNumber(numeric, 2)) return '2ch';
		return '1ch';
	}
	if (norm.startsWith('ezr')) return 'ezr';
	if (norm.startsWith('neh')) return 'neh';
	if (norm.startsWith('est')) return 'est';
	if (norm.startsWith('job')) return 'job';
	if (norm.startsWith('ps') && !norm.includes('solo')) {
		if (includesNumber(numeric, 3)) return 'ps2';
		if (includesNumber(numeric, 2)) return 'ps3';
		return 'psa';
	}
	if (norm.startsWith('pr')) return 'pro';
	if (norm.startsWith('ecc') || norm.startsWith('qoh')) return 'ecc';
	if ((norm.startsWith('song') || norm.startsWith('cant')) && !norm.includes('young')) return 'sng';
	if (norm.startsWith('isa')) return 'isa';
	if (norm.startsWith('jer') && !eng.includes('letter')) return 'jer';
	if (norm.startsWith('lam')) return 'lam';
	if (norm.startsWith('eze')) return 'ezk';
	if (norm.startsWith('dan')) {
		if (norm.includes('g')) return 'dag'; // daniel greek
		return 'dan';
	}
	if (norm.startsWith('hos')) return 'hos';
	if (norm.startsWith('joe')) return 'jol';
	if (norm.startsWith('am')) return 'amo';
	if (norm.startsWith('oba')) return 'oba';
	if (norm.startsWith('jon')) return 'jon';
	if (norm.startsWith('mic')) return 'mic';
	if (norm.startsWith('na')) return 'nam';
	if (norm.startsWith('hab')) return 'hab';
	if (norm.startsWith('zep')) return 'zep';
	if (norm.startsWith('hag')) return 'hag';
	if (norm.startsWith('zec')) return 'zec';
	if (norm.startsWith('mal')) return 'mal';
	if (norm.startsWith('mat')) return 'mat';
	if (norm.startsWith('mar')) return 'mrk';
	if (norm.startsWith('luk')) return 'luk';
	if (norm.startsWith('act')) return 'act';
	if (norm.startsWith('rom')) return 'rom';
	if (norm.startsWith('co')) {
		if (includesNumber(numeric, 2)) return '2co';
		if (includesNumber(numeric, 1)) return '1co';
	}
	if (norm.startsWith('gal')) return 'gal';
	if (norm.startsWith('eph')) return 'eph';
	if (norm.startsWith('philip')) return 'php';
	if (norm.startsWith('co')) return 'col';
	if (norm.startsWith('th')) {
		if (includesNumber(numeric, 2)) return '2th';
		return '1th';
	}
	if (norm.startsWith('tit')) return 'tit';
	if (norm.startsWith('ti')) {
		if (includesNumber(numeric, 2)) return '2ti';
		return '1ti';
	}
	if (norm.startsWith('phile') || norm == 'phlm') return 'phm';
	if (norm.startsWith('heb')) return 'heb';
	if (norm.startsWith('ja')) return 'jas';
	if (norm.startsWith('pe')) {
		if (includesNumber(numeric, 2)) return '2pe';
		return '1pe';
	}
	if (norm.startsWith('jo') || norm.startsWith('jn') || norm.startsWith('jh')) {
		if (includesNumber(numeric, 3)) return '3jn';
		if (includesNumber(numeric, 2)) return '2jn';
		if (includesNumber(numeric, 1)) return '1jn';
		return 'jhn';
	}
	if (norm.startsWith('jud')) return 'jud';
	if (norm.startsWith('rev')) return 'rev';
	// deuterocanonicals
	if (norm.startsWith('tob')) return 'tob'; // tobit
	if (norm.startsWith('jdt') || norm.startsWith('judi')) return 'jdt'; // judith
	if (norm.startsWith('est')) return 'esg'; // esther greek
	if (norm.startsWith('wis')) return 'wis'; // wisdom of solomon
	if (norm.startsWith('sir')) return 'sir'; // sirach
	if (norm.includes('bar')) {
		if (includesNumber(numeric, 4)) return '4ba';
		if (includesNumber(numeric, 2)) return '2ba';
		if (eng.includes('letter')) return 'lba'; // letter of baruch
		return 'bar'; // baruch
	}
	if (norm.startsWith('jer')) return 'lje'; // letter of jeremiah
	if (norm.startsWith('song')) return 's3y'; // Song of the 3 Young Men
	if (norm.startsWith('sus')) return 'sus'; // Susanna
	if (norm.startsWith('bel')) return 'bel'; // Bel and the Dragon
	if (norm.startsWith('ma')) {
		if (includesNumber(numeric, 4)) return '4ma'; // Maccabees
		if (includesNumber(numeric, 3)) return '3ma'; // Maccabees
		if (includesNumber(numeric, 2)) return '2ma'; // Maccabees
		return '1ma';
	}
	if (norm.startsWith('es')) {
		if (includesNumber(numeric, 2)) return '2es'; // Esdras (Greek)
		return '1es';
	}
	if (norm.startsWith('man')) return 'man'; // Prayer of Manasseh
	if (norm.startsWith('oda') || norm.startsWith('ode')) return 'oda'; // Odae/Odes
	if (norm.startsWith('ps')) return 'pss'; // Psalms of Solomon
	if (norm.startsWith('ez')) {
		if (includesNumber(numeric, 6)) return '6ez';
		if (includesNumber(numeric, 5)) return '5ez';
		return 'eza'; // Ezra Apocalypse
	}
	if (norm.startsWith('jub')) return 'jub'; // Jubilees
	if (norm.startsWith('eno')) return 'eno'; // Enoch
	if (norm.startsWith('me') || norm.startsWith('mq')) {
		if (includesNumber(numeric, 3)) return '3mq';
		if (includesNumber(numeric, 2)) return '2mq';
		return '1mq'; // Meqabyan/Mekabis
	}
	if (norm.startsWith('rep')) return 'rep'; // Reproof
	if (norm.startsWith('lao')) return 'lao'; // Letter to the Laodiceans

	throw Error(`Unknown book ${norm}`);
}

export function isNewTestament(book: Book): boolean {
	switch (book) {
	case 'mat':
	case 'mrk':
	case 'luk':
	case 'act':
	case 'rom':
	case '2co':
	case '1co':
	case 'gal':
	case 'eph':
	case 'php':
	case 'col':
	case '2th':
	case '1th':
	case 'tit':
	case '2ti':
	case '1ti':
	case 'phm':
	case 'heb':
	case 'jas':
	case '2pe':
	case '1pe':
	case '3jn':
	case '2jn':
	case '1jn':
	case 'jhn':
	case 'jud':
	case 'rev':
		return true;
	default:
		return false;
	}
}

function romanize(n: number) {
	const lookup = {
		M: 1000,
		CM: 900,
		D: 500,
		CD: 400,
		C: 100,
		XC: 90,
		L: 50,
		XL: 40,
		X: 10,
		IX: 9,
		V: 5,
		IV: 4,
		I: 1,
	};
	let res = '';
	Object.entries(lookup).forEach(([k, v]) => {
		while (n >= v) {
			res += k;
			n -= v;
		}
	});
	return res;
}

const ordinals = {
	1: 'first',
	2: 'second',
	3: 'third',
	4: 'fourth',
	5: 'fifth',
	6: 'sixth',
} as { [n: number]: string };

function includesNumber(s: string, n: number) {
	if (s.includes(n.toString())) return true;
	if (s.includes(romanize(n))) return true;
	if (ordinals[n] && s.includes(ordinals[n])) return true;

	return false;
}
