/** Pages' asset binding may return 200 for Range requests. Safari probes MP4s
 * with byte ranges, so provide a streaming single-range response in that case.
 * Existing 206/304/error responses and ordinary assets are left alone. */
function fixedLength(body: ReadableStream<Uint8Array> | null, length: number) {
  const Fixed = (globalThis as typeof globalThis & { FixedLengthStream?: new (length: number) => { readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> } }).FixedLengthStream;
  if (!body || !Fixed) return body;
  const stream = new Fixed(length);
  void body.pipeTo(stream.writable).catch(() => undefined);
  return stream.readable;
}

export function applyMediaRange(request: Request, response: Response, knownSize?: number): Response {
  if (response.status !== 200) return response;
  const size = Number(response.headers.get("content-length") ?? knownSize);
  const encoding = response.headers.get("content-encoding");
  if (!Number.isSafeInteger(size) || size <= 0 || (encoding && encoding !== "identity")) return response;
  const headers = new Headers(response.headers);
  headers.set("accept-ranges", "bytes");
  headers.set("content-length", String(size));
  const full = () => new Response(fixedLength(response.body, size), { status: 200, headers });
  if (request.method !== "GET" || !response.body) return full();
  const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range")?.trim() ?? "");
  if (!match || (!match[1] && !match[2])) return full();

  const ifRange = request.headers.get("if-range");
  if (ifRange) {
    const modified = response.headers.get("last-modified");
    const matches = ifRange.startsWith('"')
      ? ifRange === response.headers.get("etag")
      : !ifRange.startsWith("W/") && modified && Number.isFinite(Date.parse(ifRange)) && Date.parse(modified) <= Date.parse(ifRange);
    if (!matches) return full();
  }

  const suffix = !match[1];
  const start = suffix ? Math.max(0, size - Number(match[2])) : Number(match[1]);
  const end = suffix || !match[2] ? size - 1 : Math.min(size - 1, Number(match[2]));
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) {
    void response.body.cancel().catch(() => undefined);
    headers.set("content-range", `bytes */${size}`);
    headers.set("content-length", "0");
    return new Response(null, { status: 416, headers });
  }

  const reader = response.body.getReader();
  let offset = 0;
  let remaining = end - start + 1;
  headers.set("content-range", `bytes ${start}-${end}/${size}`);
  headers.set("content-length", String(remaining));
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (remaining > 0) {
        const { value, done } = await reader.read();
        if (done) { controller.close(); return; }
        const from = Math.max(0, start - offset);
        offset += value.byteLength;
        if (from >= value.byteLength) continue;
        const bytes = value.subarray(from, from + remaining);
        remaining -= bytes.byteLength;
        controller.enqueue(bytes);
        if (remaining === 0) {
          controller.close();
          void reader.cancel().catch(() => undefined);
        }
        return;
      }
    },
    cancel(reason) { return reader.cancel(reason); },
  });
  return new Response(fixedLength(body, end - start + 1), { status: 206, headers });
}
