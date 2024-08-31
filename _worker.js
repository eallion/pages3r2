export default {
  async fetch(request, env) {
    // 获取请求路径
    const url = new URL(request.url);
    const pathname = url.pathname.slice(1); // 去掉前导的 "/"
    
    if (pathname === 'robots.txt') {
      return new Response(`User-agent: *
Disallow: /`, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    try {
      // 使用 Cloudflare R2 API 获取对象
      const object = await env.MY_BUCKET.get(pathname);
      
      if (object === null) {
        return new Response('Object Not Found', { status: 404 });
      }

      return new Response(object.body, {
        headers: {
          'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (err) {
      return new Response('Unauthorized', { status: 401 });
    }
  },
};
