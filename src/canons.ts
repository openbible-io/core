/**
 * From Wikipedia.
 */
export const jewish = {
	torah: [
		"gen",
		"exo",
		"lev",
		"num",
		"deu",
	] as const,
	neviim: {
		rishonim: [
			"jos",
			"jdg",
			"1sa",
			"2sa",
			"1ki",
			"2ki",
		] as const,
		aharonim: [
			"isa",
			"jer",
			"ezk",
		] as const,
		minor: [
			"hos",
			"jol",
			"amo",
			"oba",
			"jon",
			"mic",
			"nam",
			"hab",
			"zep",
			"hag",
			"zec",
			"mal",
		] as const,
	} as const,
	ketuvim: {
		poetic: [
			"psa",
			"pro",
			"job",
		] as const,
		megillot: [
			"sng",
			"rut",
			"lam",
			"ecc",
			"est",
		] as const,
		other: [
			"dan",
			"ezr",
			"neh",
			"1ch",
			"2ch",
		] as const,
	} as const,
} as const;

/**
 * From Wikipedia.
 */
export const protestant = {
	old: {
		torah: [
			"gen",
			"exo",
			"lev",
			"num",
			"deu",
		],
		historical: [
			"jos",
			"jdg",
			"rut",
			"1sa",
			"2sa",
			"1ki",
			"2ki",
			"1ch",
			"2ch",
			"ezr",
			"neh",
			"est",
		],
		wisdom: [
			"job",
			"psa",
			"pro",
			"ecc",
			"sng",
		],
		major: [
			"isa",
			"jer",
			"lam",
			"ezk",
			"dan",
		],
		minor: [
			"hos",
			"jol",
			"amo",
			"oba",
			"jon",
			"mic",
			"nam",
			"hab",
			"zep",
			"hag",
			"zec",
			"mal",
		] as const,
	},
	new: {
		gospel: [
			"mat",
			"mrk",
			"luk",
			"jhn",
		] as const,
		acts: [
			"act",
		] as const,
		paul: [
			"rom",
			"1co",
			"2co",
			"gal",
			"eph",
			"php",
			"col",
			"1th",
			"2th",
			"1ti",
			"2ti",
			"tit",
			"phm",
		] as const,
		catholic: [
			"heb",
			"jas",
			"1pe",
			"2pe",
			"1jn",
			"2jn",
			"3jn",
			"jud",
		] as const,
		apocalypse: [
			"rev",
		] as const,
	} as const,
} as const;
