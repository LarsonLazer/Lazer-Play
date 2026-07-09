# Lazer Play

Projeto inicial de uma plataforma de streaming de m�sica, v�deos, podcasts e artistas independentes.

## Estrutura
- Android: app em Kotlin com Jetpack Compose
- Backend: API REST m�nima em Node.js/Express
- Web Admin: landing page e API prontas para Vercel

## Como executar localmente

### API local
```powershell
cd g:\ROBOT\BOOMPLAY
npm install
node api/index.js
```

### Verificar a API
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/health
```

### Android
Abra a pasta android no Android Studio e execute o projeto.

## Deploy na Vercel
1. Conecte este reposit�rio � Vercel.
2. Selecione a pasta raiz do projeto.
3. O arquivo vercel.json j� configura a API e a p�gina inicial.
4. Fa�a o deploy.

### Endpoints dispon�veis
- /api/health
- /api/auth/login
- /api/auth/register
- /api/trending
