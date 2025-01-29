import type { Publication } from "../src/publication.ts";

export default {
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
		pre: {
			name: "Preface",
			nChapters: 1,
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
			nChapters: 2,
			data: {
				ast: [
					{ "text": "" },
					{ "book": "GEN" },
					{ "level": 1, "text": "Genesis\r\n" },
					{ "chapter": 1 },
					{ "level": 3, "text": "The Creation\r\n" },
					{ "break": "" },
					{ "paragraph": "" },
					"\n",
					{ "verse": 1 },
					" In the beginning ",
					" God ",
					" created ",
					" the heavens ",
					" and ",
					" the earth.",
				],
				source: [
					{
						text: "בְּרֵאשִׁ֖ית",
						attributes: { index: 9 }
					},
					{
						text: "בָּרָ֣א",
						attributes: { index: 11 }
					},
					{
						text: "אֱלֹהִ֑ים",
						attributes: { index: 10 }
					},
					"אֵ֥ת",
					{
						text: "הַשָּׁמַ֖יִם",
						attributes: { index: 12 }
					},
					{
						text: "וְאֵ֥ת",
						attributes: { index: 13 }
					},
					{
						text: "הָאָֽרֶץ׃",
						attributes: { index: 14 }
					}
				]
			},
		},
	},
	audio: {
		raspy: {
			downloadUrl: "https://openbible.io/raspy",
			license: { spdx: "CC0-1.0" },
			books: {
				gen: { seconds: 11 },
			},
			url: "https://openbible.io/audio/raspy/%b/%c.webm",
		},
	},
} as Publication;
