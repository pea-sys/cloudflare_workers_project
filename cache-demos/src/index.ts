// src/index.ts
export default {
	async fetch(
		request: Request,
		env: unknown,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);

		// /data エンドポイントでCache APIを使用
		if (url.pathname === '/data') {
			const cache = caches.default;
			const cacheKey = new Request(url.toString(), request);

			// キャッシュから取得を試みる
			const cached = await cache.match(cacheKey);
			if (cached) {
				// キャッシュヒット
				const response = new Response(cached.body, cached);
				response.headers.set('X-Cache', 'HIT');
				return response;
			}

			// キャッシュミス - 新しいデータを生成
			const data = {
				timestamp: new Date().toISOString(),
				random: Math.random(),
				message: 'This is cached data',
			};

			const resp = Response.json(data, {
				headers: {
					'Cache-Control': 'public, max-age=60',
					'X-Cache': 'MISS',
				},
			});

			// レスポンスをキャッシュに保存
			ctx.waitUntil(cache.put(cacheKey, resp.clone()));
			return resp;
		}

		return new Response('Cache API Demo - Try /data', { status: 200 });
	},
} satisfies ExportedHandler;
