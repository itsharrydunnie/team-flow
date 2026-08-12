import { INestApplication } from '@nestjs/common';
import { createE2EApp } from './helpers/create-e2e-app';
import { App } from 'supertest/types';
import request from 'supertest';

describe('Organization (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Should allow Authenticated user creates organization', async () => {
    const createAcctResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test0@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const accessToken = createAcctResponse.body.accessToken;

    return request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Organization' })
      .expect(201);
  });

  it('Non-member cannot access organization', async () => {
    const userOne = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test1@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const userOneToken = userOne.body.accessToken;

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ name: 'Test Organization' })
      .expect(201);

    const organizationId = organizationResponse.body.organization.id;

    const nonMemberResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test2@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const nonMemberToken = nonMemberResponse.body.accessToken;

    return request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .set('x-org-id', `${organizationId}`)
      .expect(403);
  });

  it('Should allow an authenticated user to retrieve their organization', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test3@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const accessToken = registerResponse.body.accessToken;

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Organization' })
      .expect(201);

    const organizationId = organizationResponse.body.organization.id;

    return request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-org-id', organizationId)
      .expect(200);
  });
});
