import { INestApplication } from '@nestjs/common';
import { createE2EApp } from './helpers/create-e2e-app';
import request from 'supertest';
import { AuthResponse, OrganizationResponse } from './helpers/interface-e2e';

describe('Organization (e2e)', () => {
  let app: INestApplication;

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

    const body = createAcctResponse.body as AuthResponse;

    const accessToken = body.accessToken;

    return request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Organization' })
      .expect(201);
  });

  it('Non-member cannot access organization', async () => {
    const userOneResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test1@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const { accessToken: userOneToken } = userOneResponse.body as AuthResponse;

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ name: 'Test Organization' })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    const nonMemberResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test2@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const { accessToken: nonMemberToken } =
      nonMemberResponse.body as AuthResponse;

    return request(app.getHttpServer())
      .get(`/organizations/${organization.id}`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .set('x-org-id', `${organization.id}`)
      .expect(403);
  });

  it('Should allow an authenticated user to retrieve their organization', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test3@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const { accessToken } = registerResponse.body as AuthResponse;

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Organization' })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    return request(app.getHttpServer())
      .get(`/organizations/${organization.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-org-id', organization.id)
      .expect(200);
  });
});
