import { spawnSync } from "node:child_process";
import serveOpts, { emitter } from "./server.ts";
import process from "node:process";

function test() {
	const spawn = spawnSync("deno", ["test", "-A"]);
	if (spawn.error) {
		console.error("FIXME", spawn.error);
		return;
	}
	const errString = spawn.stderr.toString();
	//process.stdout.write(spawn.stdout);
	process.stderr.write(errString);
	if (spawn.status != 0) emitter.error(errString);
}
const watcher = Deno.watchFs(["src", "testdata"]);

Deno.serve(serveOpts("dist"));
test();
for await (const _event of watcher) {
	test();
	emitter.change();
}
