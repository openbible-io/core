import type { Author } from './author.ts';
import type { Lang } from './lang.ts';
import type { Book } from './books.ts';
import type { Ast } from '@openbible/bconv';

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

/* Publication data. */
export type Writing = Bible;
export type Bible = {
	type: 'bible';
	preface?: Html;
	books: {
		[book in Book]?: Ast;
	};
};
/** Raw snippet not necessarily to spec. */
export type Html = string;
