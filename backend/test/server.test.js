const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../src/server');
const supertest = require('supertest');

test('GET /health returns ok', async () => {
  const response = await supertest(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('POST /api/auth/login accepts demo credentials', async () => {
  const response = await supertest(app).post('/api/auth/login').send({
    email: 'demo@lazerplay.com',
    password: '123456'
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.message, 'Login realizado com sucesso.');
});
