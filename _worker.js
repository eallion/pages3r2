export default {
	async fetch(request, env) {
		// 获取请求路径
		const url = new URL(request.url);
		const pathname = url.pathname.slice(1); // 去掉前导的 "/"

		if (pathname === 'robots.txt') {
			return new Response("User-agent: *\nDisallow: /", {
				status: 200,
				headers: {
					"Content-Type": "text/plain",
				},
			});
		}

		if (pathname === "/") {
			return new Response(
				"{\"status\":\"200\", \"message\":\"success\"}",
				{
					status: 200,
					headers: {
						"Content-Type": "application/json;charset=UTF-8"
					},
				}
			);
		}

		try {
			// 使用 Cloudflare R2 API 获取对象
			const object = await env.MY_BUCKET.get(pathname);

			if (object === null) {
				return new Response(
					"{\"status\":\"404\", \"code\":\"NoSuchKey\", \"message\":\"The specified key does not exist.\"}",
					{
						status: 404,
						headers: {
							"Content-Type": "application/json;charset=UTF-8"
						},
					}
				);
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
