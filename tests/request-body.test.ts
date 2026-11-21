import { expect, it } from "vitest";
import { readJsonBody } from "@/lib/server/request-body";

it("accepts a bounded JSON body without a declared length", async () => {
  expect(await readJsonBody(new Request("https://site.example/api", { method: "POST", body: '{"name":"valid"}' }))).toEqual({ name: "valid" });
});
it("stops reading an oversized streamed body", async () => {
  const request = new Request("https://site.example/api", { method: "POST", body: JSON.stringify({ value: "x".repeat(200) }) });
  await expect(readJsonBody(request, 100)).rejects.toThrow("Request body is too large.");
});
it("rejects malformed JSON", async () => {
  await expect(readJsonBody(new Request("https://site.example/api", { method: "POST", body: "<html>" }))).rejects.toThrow();
});
