import ProgressBar from "@deno-library/progress";

// Currently Deno's HTTP2 has issues:
// client error (SendRequest): http2 error: connection error received: not a result of an error
const client = Deno.createHttpClient({
	http2: false,
	http1: true,
});

export async function downloadFile(url: string, path: string) {
	console.log("downloading", url);
	const file = await Deno.open(path, { write: true, create: true });
	const resp = await fetch(url, { client });

	let completed = 0;
	const progress = new ProgressBar({
		total: parseInt(resp.headers.get("content-length")!),
	});
	const reader = resp.body!.getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		completed += value.length;
		await progress.render(completed);
		await file.write(value);
	}
}
