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
import translations, { type Translation } from "../../i18n.ts";
import { walkSync } from "@std/fs/walk";

type BookChapters = {
	[id: string]: { name: string; chapters: number[] };
};
export type Version = {
	html: string[];
	bookChapters: BookChapters;
};
export type Versions = {
	"": Version;
	interlinear: Version;
};

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
		super.startTag("div", false, { class: "flex" });
	}

	override endParagraph() {
		super.endTag("div");
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
				if (!book.data || id == "pre") return acc;

				const recordVisit = (
					Visitor:
						| typeof ChapterVisitor
						| typeof InterlinearVisitor,
				) => {
					const vType = Visitor == ChapterVisitor ? "" : "interlinear";

					const visitor = new Visitor(
						this.translation,
						this.pub,
						id as BookId,
						(chapter: number, chapterHtml: string[]) => {
							this.writeHtml(
								join(id, chapter.toString(), vType),
								this.renderHtml(chapterHtml),
							);
						},
					);
					visitor.visit(book.data!.ast, book.data!.source);
					this.writeHtml(join(id, vType), this.renderHtml(visitor.bookHtml));
					acc[vType].html.push(...visitor.bookHtml);

					acc[vType].bookChapters[id] = {
						name: book.name,
						chapters: visitor.chapters,
					};
				};

				recordVisit(ChapterVisitor);
				recordVisit(InterlinearVisitor);

				return acc;
			},
			{
				"": { html: [], bookChapters: {} } as Version,
				interlinear: { html: [], bookChapters: {} } as Version,
			},
		);

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

		Object.entries(versions).forEach(([id, v]) => {
			this.writeHtml(join("all", id), this.renderHtml(v.html));
		});
	}
}

export default function renderSite(pub: Publication, opts?: Partial<Options>) {
	const renderer = new HtmlRenderer(pub, opts);
	renderer.write();
}
