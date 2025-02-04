// Simple static dev server with live reloading.
import { extname, join } from "node:path";
import EventEmitter from "node:events";
import { contentType } from "@std/media-types";
import { FancyAnsi } from "fancy-ansi";

const ansi = new FancyAnsi();

const liveReload = Deno.readTextFileSync(
	import.meta.resolve("liveReload.js").replace("file://", ""),
);

type WatcherMessage = { type: "change" } | {
	type: "error";
	raw: string;
	html: string;
};
declare interface Emitter {
	addListener(event: "watcher", listener: (msg: WatcherMessage) => void): this;
}
class Emitter extends EventEmitter {
	lastError?: { type: "error"; raw: string; html: string };

	change() {
		this.lastError = undefined;
		this.emit("watcher", { type: "change" });
	}
	error(raw: string) {
		const html = ansi.toHtml(raw).replaceAll("\n", "<br>");
		this.lastError = { type: "error", raw, html };
		this.emit("watcher", this.lastError);
	}
}
export const emitter = new Emitter();
emitter.addListener("watcher", () => {}); // To prevent `.emit` from blocking.

async function tryStatFile(path: string) {
	try {
		const res = await Deno.stat(path);
		if (!res.isDirectory) return res;
	} catch {
		return undefined;
	}
}

async function resolvePath(
	path: string,
	contentType: string,
	dir: string,
): Promise<{ path: string | undefined; stat: Deno.FileInfo | undefined }> {
	let stat = await tryStatFile(path);
	if (stat) return { path, stat };

	// Direct match?
	if (contentType.includes("text/html")) {
		if (path == "/") path += "index";

		let maybePath = path + ".html";
		stat = await tryStatFile(maybePath);
		if (stat) return { path: maybePath, stat };

		maybePath = join(path, "index.html");
		stat = await tryStatFile(maybePath);
		if (stat) return { path: maybePath, stat };

		// If there's a 404 page, return it.
		maybePath = join(dir, "404.html");
		stat = await tryStatFile(maybePath);
		if (stat) return { path: maybePath, stat };

		// Otherwise we're in SPA mode, return the index page.
		maybePath = join(dir, "index.html");
		stat = await tryStatFile(maybePath);
		if (stat) return { path: maybePath, stat };
	}

	return { path: undefined, stat: undefined };
}

export default (dir: string) => ({
	hostname: "localhost",
	onListen({ hostname, port }) {
		console.log(
			"Listening on",
			`http://${hostname.replace("::1", "localhost")}:${port}`,
		);
	},
	async handler(req) {
		const url = new URL(req.url);
		// Unfortunately service workers intercept SSE streams and prevent a new
		// worker from activating until its closed.
		// Web workers can't currently touch websockets, so use that instead.
		if (url.pathname == "/liveReload") {
			if (req.headers.get("upgrade") != "websocket") {
				return new Response(null, { status: 501 });
			}

			const { socket, response } = Deno.upgradeWebSocket(req);

			let listener: (ev: WatcherMessage) => void;
			socket.addEventListener("open", () => {
				listener = (ev) => {
					socket.send(JSON.stringify(ev));
				};
				emitter.addListener("watcher", listener);
				if (emitter.lastError) listener(emitter.lastError);
			});
			socket.addEventListener("close", () => {
				emitter.removeListener("watcher", listener);
			});

			return response;
		}

		const { path, stat } = await resolvePath(
			join(dir, url.pathname),
			req.headers.get("accept") ?? "text/html",
			dir,
		);
		const status = (!path || path?.endsWith("404.html")) ? 404 : 200;
		if (!path || !stat) {
			return new Response(
				`could not resolve ${path}. check that index.html exists.`,
				{ status },
			);
		}

		// Cloudflare uses weak etags.
		const etag = `W/"${(stat.mtime!.getTime() * stat.size).toString(16)}"`;
		if (req.headers.get("if-none-match") == etag) {
			return new Response(null, { status: 304 });
		}

		const ty = contentType(extname(path)) || "text/html";
		let body;
		if (ty.includes("text/html")) {
			body = await Deno.readTextFile(path);
			body = body.replace(
				"</body>",
				`<script id="liveReload">${liveReload}</script></body>`,
			);
		} else {
			body = (await Deno.open(path, { read: true })).readable;
		}

		return new Response(body, {
			headers: {
				"content-length": stat.size.toString(),
				"content-type": ty,
				// spoof cloudflare headers that may cause app problems
				// https://developers.cloudflare.com/pages/configuration/serving-pages/
				"access-control-allow-origin": "*",
				"cache-control": "public, max-age=0, must-revalidate",
				etag,
			},
			status,
		});
	},
} as Deno.ServeTcpOptions & Deno.ServeInit<Deno.NetAddr>);
