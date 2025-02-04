import { render as preactRender } from "preact-render-to-string";
import Html from "./html/Html.tsx";
import type { BookId, Publication } from "../index.ts";
import Home from "./html/Home.tsx";
import { dirname, join } from "node:path";
import type { ComponentChildren } from "preact";
import {
	type Ast,
	type HeadingLevel,
	renderers,
	type TextAttributes,
} from "@openbible/bconv";
import ChapterNav from "./ChapterNav.tsx";
import translations, { type Translation } from "../i18n.ts";
import { walkSync } from "@std/fs/walk";
import { bookDetails, bookFromEnglish, isNewTestament } from "../books.ts";

class ChapterVisitor extends renderers.Html {
	bookName: string = "";
	bookHtml: string[] = [];
	chapterHtml: string[] = [];
	curChapter = -1;
	chapters: number[] = [];

	constructor(
		locale: Translation,
		public pub: Publication,
		public bookId: BookId,
		public onFlush: (chapter: number, chapterHtml: string[]) => void = () => {},
	) {
		super((s) => {
			this.bookHtml.push(s);
			this.chapterHtml.push(s);
		}, (c) => locale.chapter.replace("%n", c.toString()));
	}

	flushChapter() {
		if (this.inParagraph) {
			this.endTag("p");
			this.inParagraph = false;
		}
		this.chapterHtml.push(
			preactRender(
				<ChapterNav
					chapter={this.curChapter}
					chapters={this.chapters}
				/>,
			),
		);
		this.onFlush(this.curChapter, this.chapterHtml);
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
		if (this.pub.audio && !(this instanceof ReverseInterlinearVisitor)) {
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

	override visit(ast: Ast) {
		super.visit(ast);
		this.chapters = ast
			.filter((n) => typeof n == "object" && "chapter" in n)
			.map((n) => n.chapter);
		this.flushChapter();
	}
}

class InterlinearVisitor extends ChapterVisitor {
	source?: Ast;
	sourceIndex: { [key: string]: string } = {};
	bookHtmlInterlinear: string[] = [];
	chapterHtmlInterlinear: string[] = [];

	override startParagraph() {
		super.startTag("div", false, { class: "interlinear" });
	}

	override endParagraph() {
		super.endTag("div");
	}

	override visit(ast: Ast, source?: Ast) {
		if (!source) throw new Error("Interlinear requires source");
		this.source = source;
		this.sourceIndex = {};
		for (let i = 0; i < source.length; i++) {
			const n = source[i];
			if (typeof n == "string" || !("attributes" in n)) continue;
			if (n.attributes?.index !== undefined) {
				this.sourceIndex[n.attributes.index] = n.text;
			}
		}
		super.visit(ast);
	}

	override text(text: string, attributes: TextAttributes, i: number) {
		if (!text.trim()) return;
		super.startTag("ul", true);
		super.startTag("li", true);
		super.text(text, attributes, i);
		super.endTag("li");
		super.startTag("li", true);
		this.write(this.sourceIndex[i] ?? "");
		super.endTag("li");
		super.endTag("ul");
	}

	override paragraph(_class: string | undefined, i: number) {
		super.paragraph("flex", i);
	}
}

class ReverseInterlinearVisitor extends InterlinearVisitor {
	ast?: Ast;

	override startParagraph() {
		let class_ = "interlinear";
		if (!isNewTestament(bookFromEnglish(this.bookId))) class_ += " reverse";
		super.startTag("div", false, { class: class_ });
	}

	override visit(ast: Ast, source?: Ast) {
		if (!source) throw new Error("Reverse interlinear requires source");
		this.ast = ast;
		ChapterVisitor.prototype.visit.call(this, source);
	}

	override text(text: string, attributes: TextAttributes, i: number) {
		if (!text.trim()) return;
		super.startTag("ul", true);
		super.startTag("li", true);
		super.text(text, attributes, i);
		super.endTag("li");
		const matching = this.ast && this.ast[attributes.index];
		if (matching) {
			super.startTag("li", true);
			this.visitNode(matching, attributes.index);
			super.endTag("li");
		}
		super.endTag("ul");
	}
}

class VerseVisitor extends ChapterVisitor {
	source?: Ast;
	sourceIndex = 0;
	verseN = -1;

	override paragraph() {}
	override heading() {}
	override chapter(n: number) {
		super.chapter(n);
		this.startTag("table");
		this.startTag("tbody");
	}

	override flushChapter() {
		this.endTag("tbody");
		this.endTag("table");
		super.flushChapter();
	}

	override verse(n: number, _i: number) {
		if (this.verseN != n) {
			if (this.verseN != -1) {
				this.endTag("td");
				this.endTag("tr");
			}
			this.verseN = n;
			this.startTag("tr");
			this.startTag("td");
			while (true) {
				const node = this.source![this.sourceIndex++];
				const isObj = typeof node == "object";
				if (!node || (isObj && "verse" in node && node.verse != n)) {
					break;
				}
				if (node && !(isObj && ("chapter" in node || "verse" in node))) {
					this.visitNode(node, this.sourceIndex);
				}
			}
			this.endTag("td");
			this.startTag("td");
			this.startTag("sup", true);
			this.write(n.toString());
			this.endTag("sup");
			this.endTag("td");
			this.startTag("td");
		}
	}

	override visit(ast: Ast, source?: Ast) {
		if (!source) throw new Error("Interlinear requires source");
		this.source = source;
		super.visit(ast);
	}
}

const visitors = {
	"": ChapterVisitor,
	"interlinear": InterlinearVisitor,
	"reverseInterlinear": ReverseInterlinearVisitor,
	"verseByVerse": VerseVisitor,
};
type BookChapters = {
	[id: string]: { name: string; chapters: number[] };
};
export type Version = {
	html: string[];
	bookChapters: BookChapters;
};
export type Versions = {
	[k in keyof typeof visitors]: Version;
};
type Visitor = typeof visitors[keyof typeof visitors];

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
			pubDir: opts?.pubDir ?? join(import.meta.dirname!, "../../static"),
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

	renderHtml(html: string[]): string {
		return this.renderJsx(
			<main
				dangerouslySetInnerHTML={{ __html: html.join("") }}
			/>,
		);
	}

	writeHtml(path: string, text: string, isIndex: boolean = true) {
		let out = join(this.opts.outDir, path);
		if (isIndex) out = join(out, "index");
		out += ".html";

		Deno.mkdirSync(dirname(out), { recursive: true });
		Deno.writeTextFileSync(out, text, { create: true });
	}

	write() {
		if (this.opts.pubDir) copyDirContents(this.opts.pubDir, this.opts.outDir);
		this.writeHtml("404", this.renderJsx(<h1>404</h1>), false);

		const versions: Versions = Object.entries(this.pub.books).reduce(
			(acc, [id, book]) => {
				if (!book.data || !(id in bookDetails)) return acc;

				const recordVisit = (vId: keyof Versions, VisitorClass: Visitor) => {
					const visitor = new VisitorClass(
						this.translation,
						this.pub,
						id as BookId,
						(chapter: number, chapterHtml: string[]) => {
							this.writeHtml(
								join(vId, id, chapter.toString()),
								this.renderHtml(chapterHtml),
							);
						},
					);

					visitor.visit(book.data!.ast, book.data!.source);
					this.writeHtml(join(vId, id), this.renderHtml(visitor.bookHtml));
					acc[vId].html.push(...visitor.bookHtml);

					acc[vId].bookChapters[id] = {
						name: book.name,
						chapters: visitor.chapters,
					};
				};

				Object.entries(visitors).forEach(([id, Visitor]) => {
					recordVisit(id as keyof Versions, Visitor);
				});

				return acc;
			},
			Object.keys(visitors).reduce((acc, id) => ({
				...acc,
				[id]: { html: [], bookChapters: {} } as Version,
			}), {} as { [k in keyof typeof visitors]: Version }),
		);

		Object.entries(versions).forEach(([id, v]) => {
			this.writeHtml(join(id, "all"), this.renderHtml(v.html));
		});

		this.writeHtml(
			"",
			this.renderJsx(
				<Home
					translation={this.translation}
					versions={versions}
					{...this.pub}
				/>,
			),
		);
	}
}

export function writeHtml(pub: Publication, opts?: Partial<Options>) {
	const renderer = new HtmlRenderer(pub, opts);
	renderer.write();
}
