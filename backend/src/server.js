const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const users = [];

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'lazerplay-backend' });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const existing = users.find((user) => user.email === email);
  if (existing) {
    return res.status(409).json({ error: 'Usuário já existe.' });
  }

  const user = {
    id: users.length + 1,
    email,
    name: name || email.split('@')[0],
    password,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  res.status(201).json({
    message: 'Usuário criado com sucesso.',
    user: { id: user.id, email: user.email, name: user.name },
    token: `token-${user.id}`
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  const user = users.find((item) => item.email === email && item.password === password);
  if (user) {
    return res.json({
      message: 'Login realizado com sucesso.',
      user: { id: user.id, email: user.email, name: user.name },
      token: `token-${user.id}`
    });
  }

  if (email === 'demo@lazerplay.com' && password === '123456') {
    return res.json({
      message: 'Login realizado com sucesso.',
      user: { id: 999, email, name: 'Usuário demo' },
      token: 'demo-token'
    });
  }

  return res.status(401).json({ error: 'Credenciais inválidas.' });
});

app.get('/api/trending', (req, res) => {
  res.json({
    items: [
      { id: 1, title: 'Noite Tropical', type: 'music' },
      { id: 2, title: 'Podcast do Dia', type: 'podcast' },
      { id: 3, title: 'Novo clipe', type: 'video' }
    ]
  });
});

app.get('/api/home', (req, res) => {
  res.json({
    featured: ['Nova onda', 'Noite tropical', 'Acústico indie'],
    playlists: ['Para estudar', 'Noite', 'Podcast mix']
  });
});

function startServer(port = PORT) {
  return app.listen(port, () => {
    console.log(`Lazer Play backend running on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
