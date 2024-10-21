/** Usually of a publication, but can also be a Bible character. */
export interface Author {
	name: string;
	/** Unique. */
	url: string;
	/** For any writing. */
	qualifications?: string[];
	/** To a specific writing. */
	contributions?: string[];
}
