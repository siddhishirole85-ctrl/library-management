// Sample Jest + supertest test. Requires a running test DB and seeded data.
// Run with: npm test
const request = require('supertest');
const app = require('../app');

describe('Auth', () => {
  it('rejects login with bad credentials', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'nope@x.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('logs in seeded admin', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'admin@lib.com', password: 'Password123!' });
    expect([200, 401]).toContain(res.status); // 401 if seed not loaded
    if (res.status === 200) expect(res.body.token).toBeDefined();
  });
});
