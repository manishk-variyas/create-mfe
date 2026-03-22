import path from 'path';
import { writeFile, writeJson } from '../utils/fs';

export async function generateApi(apiDir: string, workspaceName: string): Promise<void> {
  await writeJson(path.join(apiDir, 'package.json'), {
    name: `@${workspaceName}/api`,
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'node src/server.js',
      start: 'node src/server.js',
    },
    dependencies: {
      express: '^4.18.2',
      cors: '^2.8.5',
    },
    devDependencies: {
      nodemon: '^3.0.2',
    },
  });

  await writeFile(path.join(apiDir, 'src', 'server.js'), `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user' },
];

const products = [
  { id: 1, name: 'Laptop', price: 999, category: 'electronics' },
  { id: 2, name: 'Phone', price: 699, category: 'electronics' },
  { id: 3, name: 'Tablet', price: 449, category: 'electronics' },
  { id: 4, name: 'Headphones', price: 199, category: 'electronics' },
];

const orders = [
  { id: 1, userId: 1, productId: 1, status: 'delivered', total: 999 },
  { id: 2, userId: 2, productId: 2, status: 'pending', total: 699 },
  { id: 3, userId: 1, productId: 4, status: 'shipped', total: 199 },
];

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  user ? res.json(user) : res.status(404).json({ error: 'User not found' });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  product ? res.json(product) : res.status(404).json({ error: 'Product not found' });
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  order ? res.json(order) : res.status(404).json({ error: 'Order not found' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`API server running at http://localhost:\${PORT}\`);
});
`);
}