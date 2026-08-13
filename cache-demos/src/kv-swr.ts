// src/kv-swr.ts
type SWRMetadata = {
	storedAt: number; // ms since epoch
	maxAge: number; // ms
	swr: number; // ms
};

// キャッシュポリシー: 30秒間新鮮、その後5分間はSWR
// 実運用ではエンドポイントごとに調整することを推奨
const POLICY = { maxAge: 30_000, swr: 300_000 };

export default {
	async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(req.url);
		if (url.pathname !== '/kv-swr') {
			return new Response('not found', { status: 404 });
		}

		// クエリパラメータからキーを取得（デフォルトは"demo"）
		const key = url.searchParams.get('key') ?? 'demo';
		const now = Date.now();

		// KVからデータとメタデータを同時に取得
		const { value: cached, metadata } = await env.CACHE_KV.getWithMetadata<unknown, SWRMetadata>(key, 'json');

		if (cached && metadata) {
			// キャッシュの状態を判定
			const freshUntil = metadata.storedAt + metadata.maxAge;
			const staleUntil = freshUntil + metadata.swr;

			// ケース1: 新鮮なデータ
			if (now < freshUntil) {
				return Response.json(cached, {
					headers: {
						'X-KV-SWR': 'fresh',
						'Cache-Control': 'public, max-age=5',
					},
				});
			}

			// ケース2: SWR期間内（古いが許容範囲）
			if (now < staleUntil) {
				// 裏で非同期に更新を実行
				// 注意: KVの結果整合性により、複数のエッジで重複更新が発生する可能性があります
				ctx.waitUntil(revalidateAndStore(key, env));
				return Response.json(cached, {
					headers: { 'X-KV-SWR': 'stale' },
				});
			}

			// ケース3: 期限切れ - 同期的に更新
			const data = await fetchSource(key);
			await store(env, key, data, POLICY);
			return Response.json(data, {
				headers: {
					'X-KV-SWR': 'expired->refreshed',
					'Cache-Control': 'public, max-age=5',
				},
			});
		}

		// ケース4: キャッシュミス - 新規取得
		const data = await fetchSource(key);
		await store(env, key, data, POLICY);
		return Response.json(data, {
			headers: {
				'X-KV-SWR': 'miss->stored',
				'Cache-Control': 'public, max-age=5',
			},
		});
	},
} satisfies ExportedHandler<Env>;

// バックグラウンドでの再検証と保存
const revalidateAndStore = async (key: string, env: Env) => {
	const data = await fetchSource(key);
	await store(env, key, data, POLICY);
};

// オリジンデータの取得（実際は上流APIを呼ぶ）
const fetchSource = async (key: string) => {
	// デモ用の擬似データ生成
	// 実運用では外部APIやデータベースからデータを取得
	return {
		key,
		value: Math.random(),
		updatedAt: new Date().toISOString(),
	};
};

// KVへのデータ保存
const store = async (env: Env, key: string, data: unknown, policy: { maxAge: number; swr: number }) => {
	const metadata: SWRMetadata = {
		storedAt: Date.now(),
		maxAge: policy.maxAge,
		swr: policy.swr,
	};

	// KVのTTLを計算（maxAge + swrの総時間）
	const ttlSec = Math.ceil((policy.maxAge + policy.swr) / 1000);

	await env.CACHE_KV.put(key, JSON.stringify(data), {
		// KVの最小TTLは60秒なので、それ未満の場合は60秒に設定
		expirationTtl: Math.max(60, ttlSec),
		metadata,
	});
};
