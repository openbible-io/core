import type { Author } from "./author.ts";
import type { BookId } from "./books.ts";
import type { Ast } from "@openbible/bconv";

/** Uniquely identify speaker + music. */
export type AudioBookId = string;
/** Will be used for Table of Contents and rendering. */
export interface Book {
	/** In language of publication. */
	name: string;
	data?: {
		ast: Ast;
		source?: Ast;
	};
}

interface Work {
	downloadUrl: string;
	publisher?: string;
	publisherUrl?: string;
	publishDate?: string;
	license: { url: string } | { spdx: string } | { text: string };
	authors?: Author[];
	isbns?: { [edition: string]: number };
}

/** A `Work` with per-book audio info. */
export interface Audio extends Work {
	/** Metadata for books that have audio. */
	books: {
		[book in BookId]?: {
			seconds: number;
			bytes: number;
		};
	};
	/** %b = book id, %c = chapter */
	url: string;
}

/** Copyrightable text. */
export interface Publication extends Work {
	/** Short string, usually 3 uppercase chars. */
	id: string;
	title: string;
	/** [BCP47](https://www.rfc-editor.org/info/bcp47) */
	lang: string;
	books: { [book in BookId]?: Book };
	audio?: { [id in AudioBookId]?: Audio };
}
