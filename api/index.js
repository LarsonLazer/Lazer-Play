const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const fallbackContent = {
  hero: {
    badge: 'Lançamento em destaque • Cyberpunk Serenade',
    title: 'Descubra a próxima onda do som.',
    subtitle: 'Uma experiência moderna de streaming com áudio premium, descoberta elegante e ferramentas feitas para artistas.',
    primaryCta: 'Ouvir agora',
    secondaryCta: 'Abrir painel',
    demoBadge: 'Login demo: demo@lazerplay.com / 123456',
    apiBadge: 'Conteúdo carregado pela API do Vercel'
  },
  nav: {
    discovery: 'Descobrir',
    library: 'Biblioteca',
    liked: 'Curtidas',
    artistHub: 'Hub do artista',
    upgradeTitle: 'Atualize para Pro',
    upgradeDescription: 'Desbloqueie áudio sem perdas e acesso antecipado.',
    upgradeCta: 'Assinar'
  },
  releases: [
    { title: 'Noite Neon', subtitle: 'Synthwave Pulse' },
    { title: 'Coração Glitch', subtitle: 'Electric Echo' },
    { title: 'Céu Estático', subtitle: 'Vapor Clouds' },
    { title: 'Foco Laser', subtitle: 'The Prism' }
  ],
  tracks: [
    { title: 'Onda da Gravidade', artist: 'Orbital Mind', badge: '#1 em alta' },
    { title: 'After Dark', artist: 'Urban Nocturne', badge: 'Novo' },
    { title: 'Velocity', artist: 'Mach 5', badge: 'Quente' }
  ],
  premium: [
    { name: 'Individual • R$ 39,90/mês', description: 'Sem anúncios e downloads ilimitados.', featured: true },
    { name: 'Family Hub • R$ 59,90/mês', description: 'Playlists compartilhadas e controles parentais.', featured: false }
  ],
  artists: [
    { name: 'Xenon', followers: '1,2M' },
    { name: 'Lyra', followers: '890K' },
    { name: 'Echo Core', followers: '2,5M' }
  ],
  player: {
    title: 'Vapor Drift',
    artist: 'Lazer Horizon',
    badge: 'Ao vivo',
    progress: '1:24',
    duration: '3:45'
  },
  admin: {
    title: 'Painel administrativo',
    subtitle: 'Gerencie usuários, artistas, conteúdos e finanças em um só lugar.',
    metrics: [
      { label: 'Fluxo de streams', value: '2,4M' },
      { label: 'Ouvintes', value: '482K' },
      { label: 'Receita', value: 'R$ 12,450' }
    ],
    actions: ['Aprovar novos uploads', 'Enviar atualização de campanha', 'Revisar insights de fãs'],
    tracks: [
      { name: 'Cybernetic Heartbeat', streams: '1,2M', status: 'Ativo' },
      { name: 'Midnight Transmission', streams: '842K', status: 'Boosting' },
      { name: 'Orbital Echoes', streams: '312K', status: 'Revisão' }
    ],
    payouts: [
      { label: '24 ago', value: 'R$ 4.210' },
      { label: '24 set', value: 'Pendente' }
    ]
  }
};

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

  try {
    const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
    if (error) {
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

async function writeUser(user) {
  if (!supabase) {
    return user;
  }

  try {
    const { error } = await supabase.from('users').insert(user);
    if (error) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

async function getContentPayload(scope = 'app') {
  if (!supabase) {
    return scope === 'admin' ? { ...fallbackContent } : fallbackContent;
  }

  try {
    const { data, error } = await supabase.from('app_content').select('*').order('id', { ascending: true });
    if (error || !Array.isArray(data) || !data.length) {
      return scope === 'admin' ? fallbackContent.admin : fallbackContent;
    }

    const pick = (key, fallback) => {
      const entry = data.find((item) => item.key === key || item.slug === key || item.name === key);
      if (!entry) {
        return fallback;
      }
      return entry.value ?? entry.content ?? entry.text ?? fallback;
    };

    const content = scope === 'admin' ? { ...fallbackContent, admin: { ...fallbackContent.admin } } : { ...fallbackContent };
    content.hero.badge = pick('hero_badge', content.hero.badge);
    content.hero.title = pick('hero_title', content.hero.title);
    content.hero.subtitle = pick('hero_subtitle', content.hero.subtitle);
    content.hero.primaryCta = pick('hero_primary_cta', content.hero.primaryCta);
    content.hero.secondaryCta = pick('hero_secondary_cta', content.hero.secondaryCta);
    content.hero.demoBadge = pick('hero_demo_badge', content.hero.demoBadge);
    content.hero.apiBadge = pick('hero_api_badge', content.hero.apiBadge);
    content.nav.discovery = pick('nav_discovery', content.nav.discovery);
    content.nav.library = pick('nav_library', content.nav.library);
    content.nav.liked = pick('nav_liked', content.nav.liked);
    content.nav.artistHub = pick('nav_artist_hub', content.nav.artistHub);
    content.nav.upgradeTitle = pick('nav_upgrade_title', content.nav.upgradeTitle);
    content.nav.upgradeDescription = pick('nav_upgrade_description', content.nav.upgradeDescription);
    content.nav.upgradeCta = pick('nav_upgrade_cta', content.nav.upgradeCta);
    content.admin.title = pick('admin_title', content.admin.title);
    content.admin.subtitle = pick('admin_subtitle', content.admin.subtitle);
    return content;
  } catch {
    return scope === 'admin' ? fallbackContent.admin : fallbackContent;
  }
}

async function handler(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok', service: 'lazerplay-vercel' });
  }

  if (req.method === 'GET' && pathname === '/api/content') {
    const scope = url.searchParams.get('scope') || 'app';
    const payload = await getContentPayload(scope);
    return sendJson(res, 200, payload);
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
      return sendJson(res, 400, { error: 'E-mail e senha são obrigatórios.' });
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
