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
			ast: [
				{
					"text": "Hope you like my publication!",
				},
			]
		},
		gen: {
			name: "Genesis",
			nChapters: 2,
			ast: [
				{ "text": "" },
				{ "book": "GEN" },
				{ "level": 1, "text": "Genesis\r\n" },
				{ "chapter": 1 },
				{ "level": 3, "text": "The Creation\r\n" },
				{ "break": "" },
				{ "paragraph": "" },
				{ "text": "\n" },
				{ "verse": 1 },
				{
					"text":
						"In the beginning God created the heavens and the earth. \r\n",
					"footnote": "OMG!!!"
				},
				{ "break": "" },
				{ "paragraph": "" },
				{ "text": "\n" },
				{ "chapter": 2 },
				{ "break": "" },
				{ "paragraph": "" },
				{ "verse": 1 },
				{
					"text":
						"Now the serpent was more crafty than any beast of the field that the LORD God had made. And he said to the woman, “Did God really say, ‘You must not eat from any tree in the garden?’”",
				},
			],
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
