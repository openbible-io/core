import { render as preactRender } from "preact-render-to-string";
import Html from "./html/Html.tsx";
import type { BookId, Publication } from "../index.ts";
import Home from "./html/Home.tsx";
import { join } from "node:path";
import type { ComponentChildren } from "preact";
import BookIndex from "./html/BookIndex.tsx";
import {
	type Ast,
	type HeadingLevel,
	renderers,
	type TextAttributes,
} from "@openbible/bconv";
import ChapterNav from "./ChapterNav.tsx";
import translations, { type Translation } from "../../i18n.ts";
import { walkSync } from "@std/fs/walk";

class ChapterVisitor extends renderers.Html {
	bookName: string = "";
	bookHtml: string[] = [];
	chapterHtml: string[] = [];
	curChapter = -1;

	/** For interlinear */
	source?: Ast;
	sourceIndex: { [key: string]: string } = {};

	bookHtmlInterlinear: string[] = [];
	chapterHtmlInterlinear: string[] = [];

	constructor(
		public pub: Publication,
		public bookId: BookId,
		locale: Translation,
		// TODO: better control sinks
		public onFlush: (
			chapter: number,
			chapterHtml: string[],
			chapterHtmlInterlinear: string[],
		) => void = () => {},
	) {
		super((s) => {
			this.bookHtml.push(s);
			this.chapterHtml.push(s);
			this.bookHtmlInterlinear.push(s);
			this.chapterHtmlInterlinear.push(s);
		}, (c) => locale.chapter.replace("%n", c.toString()));
	}

	flushChapter() {
		this.chapterHtml.push(
			preactRender(
				<ChapterNav
					chapter={this.curChapter}
					nChapters={this.pub.books[this.bookId]!.nChapters}
				/>,
			),
		);
		if (this.inParagraph) {
			this.endTag("p");
			this.inParagraph = false;
		}
		this.onFlush(
			this.curChapter,
			this.chapterHtml,
			this.chapterHtmlInterlinear,
		);
		this.chapterHtml = [this.bookName];
	}

	override book() {}

	override heading(level: HeadingLevel, text: string, i: number) {
		if (level == 1) {
			this.bookName = `<h1>${text}</h1>`;
		}
		super.heading(level, text, i);
	}

	override chapter(n: number) {
		if (this.curChapter == -1) {
			this.curChapter = n;
		} else if (n > this.curChapter) {
			this.flushChapter();
			this.curChapter = n;
		}

		this.startTag("h2");
		this.write(this.chapterFn(n));
		if (this.pub.audio) {
			Object.values(this.pub.audio).forEach((audioBook) => {
				if (!audioBook || !(this.bookId in audioBook.books)) return;

				const src = audioBook.url
					.replace("%b", this.bookId)
					.replace("%c", this.curChapter.toString());
				this.write(`<audio controls src="${src}">`);
			});
		}
		this.endTag("h2");
	}

	override visit(ast: Ast, source?: Ast) {
		if (source) {
			this.source = source;
			this.sourceIndex = {};
			for (let i = 0; i < source.length; i++) {
				const n = source[i];
				if (typeof n == "string" || !("attributes" in n)) continue;
				if (n.attributes?.index !== undefined) {
					this.sourceIndex[n.attributes.index] = n.text;
				}
			}
		}

		super.visit(ast);
		this.flushChapter();
	}

	override text(text: string, _attributes: TextAttributes, i: number) {
		const html = `<span source="${this.sourceIndex[i]}">${text}</span>`;
		this.chapterHtmlInterlinear.push(html);
		this.bookHtmlInterlinear.push(html);
		this.chapterHtml.push(text);
		this.bookHtml.push(text);
	}
}

function copyDirContents(from: string, to: string) {
	for (const dirEntry of walkSync(from)) {
		const newPath = dirEntry.path.replace(from, to);
		if (dirEntry.isDirectory) Deno.mkdirSync(newPath, { recursive: true });
		else Deno.copyFileSync(dirEntry.path, newPath);
	}
}

export interface Options {
	outDir: string;
	pubDir: string;
	favicon: string;
	stylesheet: string;
	locale: Translation | keyof typeof translations;
}
export class HtmlRenderer {
	opts: Options;
	translation: Translation;

	constructor(public pub: Publication, opts?: Partial<Options>) {
		this.opts = {
			outDir: opts?.outDir ?? "dist",
			pubDir: opts?.pubDir ?? "public",
			favicon: opts?.favicon ?? "/favicon.svg",
			stylesheet: opts?.stylesheet ?? "/index.css",
			locale: opts?.locale ?? "en",
		};
		this.translation = typeof this.opts.locale == "string"
			? translations[this.opts.locale]
			: this.opts.locale;
	}

	renderJsx(comp: ComponentChildren): string {
		return "<!doctype html>" + preactRender(
			<Html
				pub={this.pub}
				favicon={this.opts.favicon}
				stylesheet={this.opts.stylesheet}
				translation={this.translation}
			>
				{comp}
			</Html>,
		);
	}

	renderHtml(html: string[]) {
		return this.renderJsx(
			<main
				dangerouslySetInnerHTML={{ __html: html.join("") }}
			/>,
		);
	}

	writeHtml(path: string, text: string) {
		const outDir = join(this.opts.outDir, path);
		Deno.mkdirSync(outDir, { recursive: true });

		Deno.writeTextFileSync(join(outDir, "index.html"), text, {
			create: true,
		});
	}

	write() {
		if (this.opts.pubDir) copyDirContents(this.opts.pubDir, this.opts.outDir);

		this.writeHtml(
			"",
			this.renderJsx(<Home translation={this.translation} {...this.pub} />),
		);

		Object.entries(this.pub.books).forEach(([id, book]) => {
			this.writeHtml(
				id,
				this.renderJsx(<BookIndex translation={this.translation} {...book} />),
			);
		});

		const all = Object.entries(this.pub.books).reduce((acc, [id, book]) => {
			if (!book.data || id == "pre") return acc;

			const visitor = new ChapterVisitor(
				this.pub,
				id as BookId,
				this.translation,
				(chapter, chapterHtml, chapterHtmlInterlinear) => {
					this.writeHtml(
						join(id, chapter.toString()),
						this.renderHtml(chapterHtml),
					);

					if (chapterHtmlInterlinear) {
						this.writeHtml(
							join(id, chapter.toString(), "interlinear"),
							this.renderHtml(chapterHtmlInterlinear),
						);
					}
				},
			);
			visitor.visit(book.data.ast, book.data.source);
			this.writeHtml(
				join(id, "all"),
				this.renderHtml(visitor.bookHtml),
			);
			if (visitor.bookHtmlInterlinear.length) {
				this.writeHtml(
					join(id, "interlinear"),
					this.renderHtml(visitor.bookHtmlInterlinear),
				);
			}

			acc.normal.push(...visitor.bookHtml);
			acc.interlinear.push(...visitor.bookHtmlInterlinear);

			return acc;
		}, {
			normal: [] as string[],
			interlinear: [] as string[],
		});

		this.writeHtml("all", this.renderHtml(all.normal));
		this.writeHtml("interlinear", this.renderHtml(all.interlinear));
	}
}

export default function renderSite(pub: Publication, opts?: Partial<Options>) {
	const renderer = new HtmlRenderer(pub, opts);
	renderer.write();
}
