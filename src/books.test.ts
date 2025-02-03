import { expect } from "jsr:@std/expect";
import { bookDetails, bookFromEnglish } from "./books.ts";

Deno.test("tricky books", () => {
	expect(bookFromEnglish("1 Samuel")).toBe("1sa");
	expect(bookFromEnglish("Esther")).toBe("est");
});
Deno.test("maps back to self", () => {
	Object.keys(bookDetails).forEach((p) => expect(bookFromEnglish(p)).toBe(p));
});
