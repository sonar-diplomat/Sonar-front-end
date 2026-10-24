/** Keep caller cancellation attached to streamed bodies after response headers arrive. */
export async function requestFetch(input: RequestInfo | URL, init: RequestInit, timeoutMs: number): Promise<Response> {
  const external = init.signal;
  external?.throwIfAborted();
  const deadline = new AbortController();
  const signal = external ? AbortSignal.any([external, deadline.signal]) : deadline.signal;
  const timer = setTimeout(() => deadline.abort(new DOMException('Request timed out', 'TimeoutError')), timeoutMs);
  try { return await fetch(input, { ...init, signal }); }
  finally { clearTimeout(timer); }
}
