import { render as preactRender } from "preact-render-to-string";
import Html from "./html/Html.tsx";
import type { BookId, Publication } from "../index.ts";
import Home from "./html/Home.tsx";
import { join } from "node:path";
import type { ComponentChildren } from "preact";
import BookIndex from "./html/BookIndex.tsx";
import { type Ast, type HeadingLevel, renderers } from "@openbible/bconv";
import ChapterNav from "./ChapterNav.tsx";
import translations, { type Translation } from "../../i18n.ts";
import { walkSync } from "@std/fs/walk";

class ChapterVisitor extends renderers.Html {
	bookName: string = "";
	bookHtml: string[] = [];
	chapterHtml: string[] = [];
	curChapter = -1;

	constructor(
		public pub: Publication,
		public bookId: BookId,
		locale: Translation,
		public onFlush: (chapter: number, chapterHtml: string[]) => void = () => {},
	) {
		super((s) => {
			this.bookHtml.push(s);
			this.chapterHtml.push(s);
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
			this.endTag('p');
			this.inParagraph = false;
		}
		this.onFlush(this.curChapter, this.chapterHtml);
		this.chapterHtml = [this.bookName];
	}

	override book() {}

	override heading(level: HeadingLevel, text: string) {
		if (level == 1) {
			this.bookName = `<h1>${text}</h1>`;
		}
		super.heading(level, text);
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
		this.flushChapter();
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
			if (!book.ast || id == "pre") return acc;

			const visitor = new ChapterVisitor(
				this.pub,
				id as BookId,
				this.translation,
				(chapter, chapterHtml) =>
					this.writeHtml(
						join(id, chapter.toString()),
						this.renderHtml(chapterHtml),
					),
			);
			visitor.visit(book.ast);
			this.writeHtml(
				join(id, "all"),
				this.renderHtml(visitor.bookHtml),
			);

			acc.push(...visitor.bookHtml);
			return acc;
		}, [] as string[]);

		this.writeHtml("all", this.renderHtml(all));
	}
}

export default function renderSite(pub: Publication, opts?: Partial<Options>) {
	const renderer = new HtmlRenderer(pub, opts);
	renderer.write();
}
