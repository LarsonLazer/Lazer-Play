const http = require('http');
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data', 'users.json');

function readUsers() {
  try {
    const content = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

async function parseJsonBody(req) {
  if (!req.headers['content-type']?.includes('application/json')) {
    return {};
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (!chunks.length) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

async function handler(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok', service: 'lazerplay-vercel' });
  }

  if (req.method === 'GET' && pathname === '/api/trending') {
    return sendJson(res, 200, {
      items: [
        { id: 1, title: 'Noite Tropical', type: 'music' },
        { id: 2, title: 'Podcast do Dia', type: 'podcast' },
        { id: 3, title: 'Novo clipe', type: 'video' }
      ]
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/register') {
    const body = await parseJsonBody(req);
    const { email, password, name } = body;
    const users = readUsers();

    if (!email || !password) {
      return sendJson(res, 400, { error: 'Email e senha são obrigatórios.' });
    }

    const existing = users.find((user) => user.email === email);
    if (existing) {
      return sendJson(res, 409, { error: 'Usuário já existe.' });
    }

    const user = {
      id: users.length + 1,
      email,
      name: name || email.split('@')[0],
      password
    };

    users.push(user);
    writeUsers(users);
    return sendJson(res, 201, {
      message: 'Usuário criado com sucesso.',
      user: { id: user.id, email: user.email, name: user.name },
      token: `token-${user.id}`
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const body = await parseJsonBody(req);
    const { email, password } = body;
    const users = readUsers();

    const user = users.find((item) => item.email === email && item.password === password);
    if (user) {
      return sendJson(res, 200, {
        message: 'Login realizado com sucesso.',
        user: { id: user.id, email: user.email, name: user.name },
        token: `token-${user.id}`
      });
    }

    if (email === 'demo@lazerplay.com' && password === '123456') {
      return sendJson(res, 200, {
        message: 'Login realizado com sucesso.',
        user: { id: 999, email, name: 'Usuário demo' },
        token: 'demo-token'
      });
    }

    return sendJson(res, 401, { error: 'Credenciais inválidas.' });
  }

  sendJson(res, 404, { error: 'Rota não encontrada.' });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  const server = http.createServer((req, res) => {
    handler(req, res).catch(() => {
      sendJson(res, 500, { error: 'Erro interno do servidor.' });
    });
  });

  server.listen(port, () => {
    console.log(`Lazer Play API running on port ${port}`);
  });
}

module.exports = handler;
module.exports.default = handler;
