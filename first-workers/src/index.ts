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

		switch (method) {
			case "GET":
			case "POST":
			case "PUT":
			case "DELETE":{
				return new Response(`${method}リクエストを受け取りました`, {
					headers: { "Content-Type": "text//plain;charset=UTF-8" },
				});
			}
			default: {
				return new Response(`サポートされていないメソッド：	${method}`, {
					status: 405,
					headers: { "Content-Type": "text//plain;charset=UTF-8" },
				});
			}
		}
	},
} satisfies ExportedHandler<Env>;
