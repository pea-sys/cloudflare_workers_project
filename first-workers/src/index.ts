import { Hono } from 'hono';

const users = [
	{ id: 1, name: '山田太郎', email: 'taro@example.com' },
	{ id: 2, name: '佐藤花子', email: 'hanako@example.com' },
	{ id: 3, name: '鈴木一郎', email: 'ichiro@example.com' },
];

const app = new Hono();

app.get('/', (c) => {
	return c.text('ホームページです');
});

app.get('/about', (c) => {
	return c.text('アバウトページです');
});

app.get('/users/:id', (c) => {
	const id = c.req.param('id');
	return c.text(`ユーザーID: ${id}のプロフィールページです`);
});

app.get('/api/users', async (c) => {
	return c.json({ users });
});
app.post('/api/users', async (c) => {
	try {
		const { name, email } = await c.req.json();

		if (!name || !email) {
			return c.json({ error: 'Name and email are required' }, 400);
		}

		return c.json(
			{
				message: 'User created successfully',
				user: { id: 4, name, email },
			},
			201,
		);
	} catch (error) {
		return c.json({ error: 'Invalid request body' }, 400);
	}
});

app.get('/api/users/:id', async (c) => {
	const id = Number(c.req.param('id'));
	const user = users.find((u) => u.id === id);

	if (user) {
		return c.json({ user });
	} else {
		return c.json({ error: 'User not found' }, 404);
	}
});

app.put('/api/users/:id', async (c) => {
	try {
		const id = Number(c.req.param('id'));
		const updates = await c.req.json();

		if (Object.keys(updates).length === 0) {
			return c.json({ error: 'No update data provided' }, 400);
		}

		return c.json({
			message: 'User updated successfully',
			user: { id, ...updates },
		});
	} catch (error) {
		return c.json({ error: 'Invalid Request body' }, 400);
	}
});

app.delete('/api/users/:id', async (c) => {
	const id = Number(c.req.param('id'));
	return c.json({
		message: 'User deleted successfully',
		id,
	});
});

app.notFound((c) => {
	return c.json({ error: 'Not found' }, 404);
});

app.onError((err, c) => {
	console.error('Unexpected error:', err);
	return c.json(
		{
			error: 'Internal server error',
			message: err.message,
		},
		500,
	);
});

export default {
	fetch: app.fetch,
} satisfies ExportedHandler<Env>;
