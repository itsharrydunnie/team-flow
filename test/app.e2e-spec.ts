import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from './helpers/create-e2e-app';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / should return html landing page', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .expect('Content-Type', /html/);
    expect(response.status).toBe(200);
  });

  it('GET /health should return 200', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  it('GET /docs should return 200', () => {
    return request(app.getHttpServer()).get('/docs').expect(200);
  });
});
