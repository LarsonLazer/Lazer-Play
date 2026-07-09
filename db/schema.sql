CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_content (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.todos (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_users" ON public.users;
DROP POLICY IF EXISTS "allow_public_insert_users" ON public.users;
DROP POLICY IF EXISTS "allow_public_read_app_content" ON public.app_content;
DROP POLICY IF EXISTS "allow_public_insert_app_content" ON public.app_content;
DROP POLICY IF EXISTS "allow_public_read_todos" ON public.todos;
DROP POLICY IF EXISTS "allow_public_insert_todos" ON public.todos;

CREATE POLICY "allow_public_read_users" ON public.users FOR SELECT USING (true);
CREATE POLICY "allow_public_insert_users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_public_read_app_content" ON public.app_content FOR SELECT USING (true);
CREATE POLICY "allow_public_insert_app_content" ON public.app_content FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_public_read_todos" ON public.todos FOR SELECT USING (true);
CREATE POLICY "allow_public_insert_todos" ON public.todos FOR INSERT WITH CHECK (true);

INSERT INTO public.users (email, password, name)
VALUES ('demo@lazerplay.com', '123456', 'Usuário demo')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.app_content (key, value)
VALUES
  ('hero_badge', '{"value":"Lançamento em destaque • Cyberpunk Serenade"}'::jsonb),
  ('hero_title', '{"value":"Descubra a próxima onda do som."}'::jsonb),
  ('hero_subtitle', '{"value":"Uma experiência moderna de streaming com áudio premium, descoberta elegante e ferramentas feitas para artistas."}'::jsonb),
  ('hero_primary_cta', '{"value":"Ouvir agora"}'::jsonb),
  ('hero_secondary_cta', '{"value":"Abrir painel"}'::jsonb),
  ('hero_demo_badge', '{"value":"Demo: demo@lazerplay.com / 123456"}'::jsonb),
  ('hero_api_badge', '{"value":"Conteúdo vindo da API do Vercel"}'::jsonb),
  ('admin_title', '{"value":"Painel administrativo"}'::jsonb),
  ('admin_subtitle', '{"value":"Gerencie usuários, artistas, conteúdos e finanças em um só lugar."}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.todos (name)
VALUES ('Criar primeira release'), ('Preparar campanha premium'), ('Atualizar dashboard')
ON CONFLICT DO NOTHING;
