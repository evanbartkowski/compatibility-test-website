/** Bound parsing even when Content-Length is absent (for example chunked bodies). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readJsonBody<T = any>(request: Request, limit = 1024 * 1024): Promise<T> {
  if (!request.body) throw new Error("A JSON request body is required.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      void reader.cancel().catch(() => {});
      throw new Error("Request body is too large.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("A JSON object is required.");
  return parsed as unknown as T;
}
