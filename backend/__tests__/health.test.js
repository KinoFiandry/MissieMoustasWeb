/* // backend/__tests__/health.test.js
const request = require('supertest');
const app = require('../server.js').default; // .default si vous utilisez Babel, sinon module.exports below

describe('GET /health', () => {
  it('should return status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'OK' });
  });
});
 */