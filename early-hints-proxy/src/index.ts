// src/index.ts
const ORIGIN_URL = 'https://gihyo.jp';

interface ResourceHint {
	href: string;
	rel: 'preload' | 'preconnect';
	as?: string;
	type?: string;
	crossorigin?: boolean;
}

class LinkExtractor {
	hints: ResourceHint[] = [];

	element(element: Element) {
		const rel = element.getAttribute('rel');
		const href = element.getAttribute('href');

		if (!href) return;

		if (rel === 'preconnect') {
			// preconnectはそのまま追加
			this.hints.push({
				href,
				rel: 'preconnect',
			});
		} else if (rel === 'stylesheet') {
			// スタイルシートはpreloadとして扱う
			this.hints.push({
				href,
				rel: 'preload',
				as: 'style',
			});
		} else if (rel === 'preload') {
			// 既存のpreload指定
			const as = element.getAttribute('as');
			const type = element.getAttribute('type');
			const crossorigin = element.getAttribute('crossorigin');

			this.hints.push({
				href,
				rel: 'preload',
				as: as || undefined,
				type: type || undefined,
				crossorigin: crossorigin !== null,
			});
		}
	}
}

// Linkヘッダーのフォーマット
function formatLinkHeader(hint: ResourceHint): string {
	let header = `<${hint.href}>; rel=${hint.rel}`;

	if (hint.as) {
		header += `; as=${hint.as}`;
	}
	if (hint.type) {
		header += `; type="${hint.type}"`;
	}
	if (hint.crossorigin) {
		header += `; crossorigin`;
	}

	return header;
}

// バックグラウンドでHTMLを解析
async function analyzeAndCacheHints(response: Response, cacheKey: string, env: Env): Promise<void> {
	const extractor = new LinkExtractor();
	const rewriter = new HTMLRewriter().on('link', extractor);

	// HTML全体を解析（結果は破棄）
	await rewriter.transform(response).text();

	// ヒントをKVに保存
	if (extractor.hints.length > 0) {
		await env.HINTS_CACHE.put(cacheKey, JSON.stringify(extractor.hints), { expirationTtl: 3600 }); // 1時間キャッシュ
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// オリジンサーバーへリクエスト
		const originUrl = new URL(url.pathname + url.search, ORIGIN_URL);
		const response = await fetch(originUrl, request);

		// HTMLでない場合はそのまま返す
		const contentType = response.headers.get('content-type') || '';
		if (!contentType.includes('text/html')) {
			return response;
		}

		// HTMLの場合はリソースヒントを処理
		const cacheKey = `hints:${url.pathname}`;
		const cachedHints = await env.HINTS_CACHE.get(cacheKey);

		// レスポンスをクローンして解析用に保存
		const [responseForClient, responseForAnalysis] = [response.clone(), response];

		// Linkヘッダーを追加した新しいレスポンスを作成
		const modifiedHeaders = new Headers(responseForClient.headers);

		if (cachedHints) {
			// キャッシュされたヒントをLinkヘッダーとして追加
			const hints = JSON.parse(cachedHints) as ResourceHint[];
			const linkHeaders = hints.map((hint) => formatLinkHeader(hint));
			if (linkHeaders.length > 0) {
				modifiedHeaders.set('Link', linkHeaders.join(', '));
			}
		}

		// クライアントへのレスポンスを即座に返す
		const clientResponse = new Response(responseForClient.body, {
			status: responseForClient.status,
			statusText: responseForClient.statusText,
			headers: modifiedHeaders,
		});

		// バックグラウンドでHTMLを解析してKVを更新
		ctx.waitUntil(analyzeAndCacheHints(responseForAnalysis, cacheKey, env));

		return clientResponse;
	},
} satisfies ExportedHandler<Env>;
