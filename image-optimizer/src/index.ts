// src/index.ts
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// デモページのエンドポイント（新規追加）
		if (url.pathname === '/demo') {
			return new Response(generateDemoHTML(), {
				headers: { 'Content-Type': 'text/html; charset=utf-8' },
			});
		}

		// /img/* 以外は通常のアセット配信
		if (!url.pathname.startsWith('/img/')) {
			return env.ASSETS.fetch(request);
		}

		// 画像変換処理
		return handleImageTransform(request, url, env, ctx);
	},
} satisfies ExportedHandler<Env>;

// メインの画像変換処理を一つの関数にまとめる
const handleImageTransform = async (request: Request, url: URL, env: Env, ctx: ExecutionContext): Promise<Response> => {
	// パラメータの検証と制限
	const width = Math.min(Math.max(Number(url.searchParams.get('w')) || 800, 100), 2000);
	const quality = Math.min(Math.max(Number(url.searchParams.get('q')) || 85, 30), 95);
	const fmt = url.searchParams.get('fmt') || 'auto';

	// フォーマットの決定（明示指定またはAcceptヘッダーから）
	let format: 'image/jpeg' | 'image/webp' | 'image/avif' = 'image/jpeg';
	if (fmt === 'webp') {
		format = 'image/webp';
	} else if (fmt === 'avif') {
		format = 'image/avif';
	} else if (fmt === 'auto') {
		const accept = request.headers.get('accept') || '';
		if (accept.includes('image/avif')) {
			format = 'image/avif';
		} else if (accept.includes('image/webp')) {
			format = 'image/webp';
		}
	}

	// 変換パラメータとパスからETagを生成
	const etag = `"${btoa(`${url.pathname}?w=${width}&q=${quality}&fmt=${format}`)}"`;

	// ブラウザのETagが一致すれば304を返す
	const ifNoneMatch = request.headers.get('If-None-Match');
	if (ifNoneMatch === etag) {
		return new Response(null, { status: 304 });
	}

	// キャッシュキーの生成
	const cacheKey = new Request(`${url.origin}${url.pathname}?w=${width}&q=${quality}&fmt=${format}`, { method: 'GET' });
	const cache = caches.default;

	// キャッシュからの取得を試みる
	const cached = await cache.match(cacheKey);
	if (cached) {
		return cached;
	}

	// オリジナル画像をAssetsから取得
	const assetResponse = await env.ASSETS.fetch(request);

	if (!assetResponse.ok) {
		return new Response('Image not found', { status: 404 });
	}

	if (!assetResponse.body) {
		return new Response('Image has no body', { status: 500 });
	}

	// Images Bindingで変換
	const transformed = await env.IMAGES.input(assetResponse.body).transform({ width }).output({ format, quality });

	// 変換結果からレスポンスを取得
	const transformedResponse = transformed.response();

	// レスポンスにキャッシュヘッダーとETagを追加
	const response = new Response(transformedResponse.body, {
		headers: {
			...Object.fromEntries(transformedResponse.headers),
			'Cache-Control': 'public, max-age=31536000, immutable',
			ETag: etag,
			Vary: 'Accept',
		},
		status: transformedResponse.status,
	});

	// Cache APIに保存（非同期）
	ctx.waitUntil(cache.put(cacheKey, response.clone()));

	return response;
};

// デモページのHTML生成
const generateDemoHTML = (): string => {
	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>レスポンシブ画像デモ</title>
</head>
<body>
  <img
    src="/img/hero.jpg?w=640"
    srcset="/img/hero.jpg?w=320 320w, /img/hero.jpg?w=640 640w,
            /img/hero.jpg?w=1280 1280w, /img/hero.jpg?w=1920 1920w"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
    alt="レスポンシブ画像デモ"
  >
</body>
</html>`;
};
