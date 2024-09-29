## Licensing
OpenBible holds no exlusive license for any content so that ANYONE can rehost any content. Let nothing hinder spreading God's word.

Hosted works allow free redistrubution.
The code to parse each work follows the work's license as a courtesy to the work and eliminate confusion when packaging.

## Packaging
Each piece of content is generally given a single repo for its data and parsing.
If data correction is needed OpenBible maintains separate data repo. The parsing repo then includes the data repo as a git submodule.

Parsers normalize source data and do data conversion.
They generally do NOT validate data across rows. They avoid non-systematic transforms.

Currently, `package.json` files are used as a manifest and published to [NPM](https://npmjs.com). Each package has the following `openbible` field:
```json
"openbible": {
	"bibles" | "dictionaries": {
		"id": {
			"title": string,
			"downloadUrl": string,
			"publisher": string,
			"publisherUrl": string,
			"license": string,
			"files": string[] // may include globs!
		}
	}
}
```

## Rendering
Data is ingested into a SQLite database and foriegn keys established. Relevant tables and columns are then  rendered to a statically served CSV.
