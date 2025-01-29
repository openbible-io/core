import { expect } from "jsr:@std/expect";
import { bookDetails, fromEnglish } from "./books.ts";

Deno.test("tricky books", () => {
	expect(fromEnglish("1 Samuel")).toBe("1sa");
	expect(fromEnglish("Esther")).toBe("est");
});
Deno.test("maps back to self", () => {
	Object.keys(bookDetails).forEach((p) => expect(fromEnglish(p)).toBe(p));
});
