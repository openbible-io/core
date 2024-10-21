import type { Author } from './author.ts';
import type { Lang } from './lang.ts';
import type { Book, BookDetail } from './books.ts';

/** Publication metadata. */
export interface Publication {
	title: string;
	lang: Lang;
	downloadUrl: string;
	publisher: string;
	publisherUrl?: string;
	publishDate?: string;
	isbn?: number;
	/** [SPDX identifier](https://spdx.org/licenses/) */
	license: string;
	licenseUrl?: string;
	authors?: Author[];
	writings?: Writing[];
}

export type Writing = Bible;
export type Bible = {
	type: 'bible';
	preface?: Html;
	books: {
		[book in Book]?: {
			detail?: BookDetail;
			html: Html;
		};
	};
};
/** Raw snippet not necessarily to spec. */
export type Html = string;
