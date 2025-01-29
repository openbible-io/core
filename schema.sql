-- This file is the source of truth for Typescript types.

-- People wrote ideas...
CREATE TABLE IF NOT EXISTS book (
	id TEXT PRIMARY KEY, -- lowercase https://ubsicap.github.io/usfm/identification/books.html
	is_nt INTEGER NOT NULL -- is new testament
);

-- ...on artifacts like paper...
CREATE TABLE IF NOT EXISTS artifact (
	name TEXT PRIMARY KEY,
	book_id TEXT REFERENCES book(id),
	date TEXT,
	discovered_date TEXT
) WITHOUT ROWID;

-- ...and those ideas became traditions.
CREATE TABLE IF NOT EXISTS tradition (
	name TEXT PRIMARY KEY,
	start_date TEXT
);

-- Those traditions adopted canons of the best books...
CREATE TABLE IF NOT EXISTS canon (
	name TEXT PRIMARY KEY, -- self-identified name
	tradition TEXT NOT NULL REFERENCES tradition(name),
	start_date TEXT
);
CREATE TABLE IF NOT EXISTS canon_book (
	canon_id INTEGER NOT NULL REFERENCES canon(id),
	book_id TEXT NOT NULL REFERENCES book(id),
	PRIMARY KEY (canon_id, book_id)
);

-- -- ...which are made up of words we'd like to be as accurate as possible.
-- CREATE TABLE IF NOT EXISTS book_word (
-- 	book_id TEXT NOT NULL REFERENCES book(id),
-- 	order INTEGER NOT NULL,
-- 	locale TEXT NOT NULL, -- in bcp 47 format
-- 	word TEXT NOT NULL,
-- 	PRIMARY KEY (book_id, order)
-- ) WITHOUT ROWID;

-- -- We have many images of many early artifacts...
-- CREATE TABLE IF NOT EXISTS artifact_img (
-- 	id TEXT PRIMARY KEY, -- use whatever format best captures image
-- 	artifact TEXT NOT NULL REFERENCES artifact(name),
-- 	page INTEGER, -- use whatever system is common
-- 	side TEXT, -- 'front' | 'back'
-- 	photographer TEXT,
-- 	date TEXT,
-- 	place TEXT,
-- 	url TEXT,
-- 	transcription TEXT
-- );
-- 
-- -- ...and those many images show transcribable words...
-- CREATE TABLE IF NOT EXISTS artifact_img_word (
-- 	artifact_img_id INTEGER NOT NULL REFERENCES artifact_img(id),
-- 	order INTEGER NOT NULL,
-- 	baseline_path TEXT NOT NULL,
-- 	font TEXT,
-- 	text TEXT NOT NULL,
-- 	artifact_word_order INTEGER REFERENCES artifact_word(order),
-- 	PRIMARY KEY (artifact_img_id, order)
-- );
-- 
-- -- ...we can read in order.
-- CREATE TABLE IF NOT EXISTS artifact_word (
-- 	artifact TEXT NOT NULL REFERENCES artifact(name),
-- 	order INTEGER NOT NULL,
-- 	text TEXT NOT NULL,
-- 	book_word_order INTEGER REFERENCES book_word(order), -- and align to book words.
-- 	PRIMARY KEY (artifact_id, order)
-- ) WITHOUT ROWID;

--  Most readers don't understand `book_word`s and instead read or listen to
-- works of authors who translate them...
CREATE TABLE IF NOT EXISTS author (
	url TEXT PRIMARY KEY,
	name TEXT,
	qualifications TEXT -- nice things they've done
);

-- ...via  publishers who distribute the author's work.
CREATE TABLE IF NOT EXISTS publisher (
	id INTEGER PRIMARY KEY, -- Some have strange long changing names.
	name TEXT,
	url TEXT
);

-- These materials are protected under licenses...
CREATE TABLE IF NOT EXISTS license (
	name TEXT PRIMARY KEY,
	url TEXT,
	text TEXT
);

-- ...and published in publications...
CREATE TABLE IF NOT EXISTS publication (
	id TEXT PRIMARY KEY, -- Short lowercase id like "niv" or "bsb_audio"
	publisher_id INTEGER REFERENCES publisher(id),
	license INTEGER REFERENCES license(name),
	date TEXT,
	url TEXT, -- Where to download
	title TEXT, -- "New International Version"
	bytes INTEGER, -- Of all downloads to display progress
	isbn INTEGER, -- For translations/commentaries
	type TEXT -- 'translation', 'audio', 'commentary'
);

--- ...by authors who contribute.
CREATE TABLE IF NOT EXISTS publication_author (
	publication_id TEXT REFERENCES publication(id),
	author_url TEXT REFERENCES author(url),
	contributions TEXT,
	PRIMARY KEY (publication_id, author_url)
);

-- Translations and their audio are made up of books...
CREATE TABLE IF NOT EXISTS publication_book (
	publication_id TEXT REFERENCES publication(id),
	book_id TEXT REFERENCES book(id),
	order INTEGER PRIMARY KEY,
	title TEXT,
	nChapters INTEGER,
	PRIMARY KEY (publication_id, order)
);

-- -- ...which are made up of words.
-- CREATE TABLE IF NOT EXISTS publication_word (
-- 	publication_id TEXT NOT NULL REFERENCES publication(id),
-- 	book_id TEXT NOT NULL REFERENCES book(id),
-- 	order INTEGER NOT NULL,
-- 	locale TEXT, -- in bcp 47 format
-- 	word TEXT NOT NULL,
-- 	chapter INTEGER NOT NULL,
-- 	verse INTEGER NOT NULL,
-- 	heading TEXT, -- before `word`
-- 	PRIMARY KEY (publication_id, book_id, order)
-- ) WITHOUT ROWID;
-- 
-- -- Translated words SHOULD be mappable back to the original book's words.
-- CREATE TABLE IF NOT EXISTS interlinear (
-- 	id INTEGER PRIMARY KEY,
-- 	publication_id INTEGER NOT NULL REFERENCES publication(id),
-- 	book_id TEXT NOT NULL REFERENCES book(id),
-- 	publication_span_start INTEGER NOT NULL,
-- 	publication_span_end INTEGER NOT NULL,
-- 	book_span_start INTEGER NOT NULL,
-- 	book_span_end INTEGER NOT NULL,
-- 	FOREIGN KEY publication_word(publication_id, book_id, publication_span_start),
-- 	FOREIGN KEY publication_word(publication_id, book_id, publication_span_end),
-- 	FOREIGN KEY book_word(book_id, book_span_start),
-- 	FOREIGN KEY book_word(book_id, book_span_end),
-- );

-- Audiobooks are distributed in chapters because CDNs do not like large files.
CREATE TABLE IF NOT EXISTS audio_chapter (
	publication_id TEXT REFERENCES publication(id),
	book_id TEXT NOT NULL REFERENCES book(id),
	chapter INTEGER,
	timestamps TEXT, -- comma separated list of when speaker starts a word
	bytes INTEGER -- For download progress
);
