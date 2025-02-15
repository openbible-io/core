import type { Publication } from "../src/publication.ts";

const pub: Publication = {
	id: "TST",
	title: "Test Publication",
	lang: "en",
	downloadUrl: "https://openbible.io",
	publisher: "TestHouse",
	publisherUrl: "https://openbible.io/testhouse",
	publishDate: "2025-01-29",
	license: { spdx: "CC0-1.0" },
	authors: [{
		name: "thesmartwon",
		url: "https://github.com/thesmartwon",
		qualifications: ["none"],
		contributions: ["small"],
	}],
	isbns: {
		"super cool edition": 1234567890123,
	},
	books: {
		frt: {
			name: "Preface",
			data: {
				ast: [
					{
						"text": "Hope you like my publication!",
					},
				],
			},
		},
		gen: {
			name: "Genesis",
			data: {
				ast: [
					/* 0 */ { "text": "" },
					/* 1 */ { "book": "GEN" },
					/* 2 */ { "level": 1, "text": "Genesis\r\n" },
					/* 3 */ { "chapter": 1 },
					/* 4 */ { "level": 3, "text": "The Creation\r\n" },
					/* 5 */ { "break": "" },
					/* 6 */ { "paragraph": "" },
					/* 7 */ "\n",
					/* 8 */ { "verse": 1 },
					/* 9 */ " In the beginning ",
					/* 10 */ " God ",
					/* 11 */ " created ",
					/* 12 */ " the heavens ",
					/* 13 */ " and ",
					/* 14 */ " the earth.",
					/* 15 */ { "verse": 2 },
					/* 16 */ " And the earth ",
				],
				source: [
					{ "chapter": 1 },
					{ "paragraph": "" },
					{ "verse": 1 },
					{
						text: "בְּרֵאשִׁ֖ית",
						attributes: { index: 9 },
					},
					{
						text: "בָּרָ֣א",
						attributes: { index: 11 },
					},
					{
						text: "אֱלֹהִ֑ים",
						attributes: { index: 10 },
					},
					"אֵ֥ת",
					{
						text: "הַשָּׁמַ֖יִם",
						attributes: { index: 12 },
					},
					{
						text: "וְאֵ֥ת",
						attributes: { index: 13 },
					},
					{
						text: "הָאָֽרֶץ׃",
						attributes: { index: 14 },
					},
					{ "verse": 2 },
					{
						text: "וְהָאָ֗רֶץ",
						attributes: { index: 16 },
					},
				],
			},
		},
	},
	audio: {
		raspy: {
			downloadUrl: "https://openbible.io/raspy",
			license: { spdx: "CC0-1.0" },
			books: {
				gen: { seconds: 11, bytes: 1000 },
			},
			url: "https://openbible.io/audio/raspy/%b/%c.webm",
		},
	},
};

export default pub;
