/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const method = request.method;
		const url = new URL(request.url);
		const path = url.pathname;

		if (method === 'GET') {
			if (path === '/' || path === '/home') {
				return new Response('ホームページ', {
					headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
				});
			} else if (path === '/about') {
				return new Response('お問い合わせページです', {
					headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
				});
			} else if (path.startsWith('/users/')) {
				const userId = path.split('/')[2];
				return new Response(`ユーザーID: ${userId}のプロフィールページです`, {
					headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
				});
			}
		} else if (method === 'POST') {
			if (path === '/users') {
				return new Response('新規ユーザーを作成しました', {
					status: 201,
					headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
				});
			} else if (path === '/login') {
				return new Response('ログインしました', {
					headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
				});
			}
		} else if (method === 'PUT') {
			if (path.startsWith('/users/')) {
				const userId = path.split('/')[2];
				return new Response(`ユーザーID: ${userId}の情報を更新しました`, {
					headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
				});
			}
		} else if (method === 'DELETE') {
			if (path.startsWith('/users/')) {
				const userId = path.split('/')[2];
				return new Response(`ユーザーID: ${userId}を削除しました`, {
					headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
				});
			}
		}
		return new Response('ページが見つかりません', {
			status: 404,
			headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
		});
	},
} satisfies ExportedHandler<Env>;
