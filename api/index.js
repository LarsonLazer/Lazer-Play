const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

async function readUsers() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
  if (error) {
    return [];
  }

  return data || [];
}

async function writeUser(user) {
  if (!supabase) {
    return user;
  }

  const { error } = await supabase.from('users').insert(user);
  if (error) {
    return null;
  }

  return user;
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

  if (req.method === 'GET' && pathname === '/api/dashboard') {
    const users = await readUsers();
    return sendJson(res, 200, {
      users: Math.max(users.length, 18),
      artists: 1240,
      streams: 985000,
      revenue: 12840,
      pending: 12
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/register') {
    const body = await parseJsonBody(req);
    const { email, password, name } = body;
    const users = await readUsers();

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

    const saved = await writeUser(user);
    if (!saved) {
      return sendJson(res, 500, { error: 'Não foi possível salvar o usuário no Supabase.' });
    }

    return sendJson(res, 201, {
      message: 'Usuário criado com sucesso.',
      user: { id: user.id, email: user.email, name: user.name },
      token: `token-${user.id}`
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const body = await parseJsonBody(req);
    const { email, password } = body;
    const users = await readUsers();

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
