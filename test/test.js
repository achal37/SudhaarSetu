// JavaScript example test using Jest
const request = require('supertest');
const app = require('../backend/server'); // Adjust the path to your server.js file

describe('API Endpoints', () => {
  it('should return 200 for the home route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  it('should return 404 for an unknown route', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
  });
});

