const noStoreHtml = (response) => {
  const headers = new Headers(response.headers);
  if (headers.get("content-type")?.includes("text/html")) {
    headers.set("cache-control", "no-store, max-age=0");
    headers.set("cdn-cache-control", "no-store");
    headers.set("pragma", "no-cache");
    headers.set("expires", "0");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) return noStoreHtml(response);
    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    return noStoreHtml(await env.ASSETS.fetch(new Request(indexUrl, request)));
  },
};

