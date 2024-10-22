import type { Author } from './author.ts';
import type { Lang } from './lang.ts';
import type { Book } from './books.ts';

/** Publication metadata. */
export type Publication = {
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
	/** HTML */
	preface?: string;
	/** Table of Contents */
	toc: Toc;
	audio?: { [id: string]: Audio };
};

export type Toc = {
	[k in Book]?: {
		name: string,
		nChapters: number,
	}
};

export interface Audio extends Omit<Publication, 'title' | 'lang' | 'isbn' | 'preface' | 'audio' | 'toc'> {
	/** Omission means that is same as parent publication. */
	toc?: Toc;
};
