import type { Author } from "./author.ts";
import type { BookId as BibleBook } from "./books.ts";
import type { Ast } from "@openbible/bconv";

export type BookId = BibleBook | "pre";
export type AudioBookId = string;

export interface Book {
	name: string;
	data?: {
		ast: Ast;
		source?: Ast;
	};
}

export type AudioBook = { seconds: number };

interface Work {
	downloadUrl: string;
	publisher?: string;
	publisherUrl?: string;
	publishDate?: string;
	license: { url: string } | { spdx: string } | { text: string };
	authors?: Author[];
	isbns?: { [edition: string]: number };
}

export interface Audio extends Work {
	books: { [book in BookId]?: AudioBook };
	/** %b = book id, %c = chapter */
	url: string;
}

export interface Publication extends Work {
	/** Short string, usually 3 uppercase chars. */
	id: string;
	title: string;
	/** [BCP47](https://www.rfc-editor.org/info/bcp47) */
	lang: string;
	books: { [book in BookId]?: Book };
	audio?: { [id in AudioBookId]?: Audio };
}
