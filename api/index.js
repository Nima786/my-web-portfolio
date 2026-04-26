export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const targetDomain = process.env.TARGET_DOMAIN; 

  if (!targetDomain) {
    return new Response("Error: TARGET_DOMAIN missing", { status: 500 });
  }

  // Build the destination URL
  const proxyUrl = targetDomain + url.pathname + url.search;
  const newHeaders = new Headers(req.headers);
  newHeaders.set('Host', new URL(targetDomain).host);

  const fetchOptions = {
    method: req.method,
    headers: newHeaders,
    redirect: 'manual'
  };

  // CRITICAL FIX: Vercel Edge requires duplex: 'half' to allow V2Ray to stream data
  if (req.body) {
    fetchOptions.body = req.body;
    fetchOptions.duplex = 'half';
  }

  try {
    return await fetch(proxyUrl, fetchOptions);
  } catch (e) {
    return new Response("Proxy Error: " + e.message, { status: 502 });
  }
}
