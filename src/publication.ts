import type { Author } from './author.ts';
import type { Lang } from './lang.ts';

export interface Publication {
	title: string;
	lang: Lang;
	downloadUrl: string;
	publisher: string;
	publisherUrl?: string;
	publishDate?: string;
	isbn?: number;
	license: string;
	licenseUrl?: string;
	authors?: Author[];
};
