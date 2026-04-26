export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const targetDomain = process.env.TARGET_DOMAIN; 

  if (!targetDomain) {
    return new Response("Error: TARGET_DOMAIN environment variable is missing.", { status: 500 });
  }

  // Build the destination URL (Your Xray Server)
  const proxyUrl = targetDomain + url.pathname + url.search;

  // Clone headers and rewrite the Host to match your Xray server
  const newHeaders = new Headers(req.headers);
  const targetHost = new URL(targetDomain).host;
  newHeaders.set('Host', targetHost);
  newHeaders.set('X-Forwarded-Host', targetHost);

  try {
    const response = await fetch(proxyUrl, {
      method: req.method,
      headers: newHeaders,
      body: req.body,
      redirect: 'manual'
    });
    return response;
  } catch (e) {
    return new Response("Proxy Error: " + e.message, { status: 502 });
  }
}
