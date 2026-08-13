import { INestApplication } from '@nestjs/common';
import { createE2EApp } from './helpers/create-e2e-app';
import request from 'supertest';
import { Role } from 'src/organizations/org.enum';
import { AuthResponse, OrganizationResponse } from './helpers/interface-e2e';

describe('Organization (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Owner can invite existing user', async () => {
    // Create owner
    const firstUserResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'firstuser@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const { accessToken: firstUserToken } =
      firstUserResponse.body as AuthResponse;

    // Owner creates organization
    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${firstUserToken}`)
      .send({ name: 'Test Organization' })
      .expect(201);
    const organization = organizationResponse.body as OrganizationResponse;

    // Create existing user to invite
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'seconduser@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    // Owner invites existing user
    await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/members`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .set('x-org-id', organization.id)
      .send({ email: 'seconduser@e2e.com', role: Role.MEMBER })
      .expect(201);
  });

  it('Admin can invite user', async () => {
    // Create owner
    const firstUserResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'firstuser-admin@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const { accessToken: firstUserToken } =
      firstUserResponse.body as AuthResponse;

    // Owner creates organization
    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${firstUserToken}`)
      .send({ name: 'Admin Test Organization' })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    // Create admin user
    const secondUserResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'seconduser-admin@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const { accessToken: secondUserToken } =
      secondUserResponse.body as AuthResponse;

    // Owner invites second user as ADMIN

    await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/members`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .set('x-org-id', organization.id)
      .send({ email: 'seconduser-admin@e2e.com', role: Role.ADMIN })
      .expect(201);

    // Create user to be invited by admin
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'thirduser-admin@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    // Admin invites third user
    const inviteResponse = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/members`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .set('x-org-id', organization.id)
      .send({ email: 'thirduser-admin@e2e.com', role: Role.MEMBER })
      .expect(201);

    expect(inviteResponse.body).toBeDefined();
  });

  it('Member cannot invite user', async () => {
    // Create owner
    const firstUserResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'firstuser-member@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const { accessToken: firstUserToken } =
      firstUserResponse.body as AuthResponse;

    // Owner creates organization
    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${firstUserToken}`)
      .send({ name: 'Member Test Organization' })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    // Create member
    const secondUserResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'seconduser-member@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    const { accessToken: secondUserToken } =
      secondUserResponse.body as AuthResponse;

    // Owner adds second user as MEMBER
    await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/members`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .set('x-org-id', organization.id)
      .send({ email: 'seconduser-member@e2e.com', role: Role.MEMBER })
      .expect(201);

    // Create user that member will attempt to invite
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'thirduser-member@e2e.com', password: 'Testpassword#1' })
      .expect(201);

    // Member attempts to invite user
    await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/members`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .set('x-org-id', organization.id)
      .send({ email: 'thirduser-member@e2e.com', role: Role.MEMBER })
      .expect(403);
  });

  it('Should return conflict when inviting an existing member', async () => {
    // Create owner
    const firstUserResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'firstuser-duplicate@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: firstUserToken } =
      firstUserResponse.body as AuthResponse;

    // Owner creates organization
    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${firstUserToken}`)
      .send({ name: 'Duplicate Test Organization' })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    // Create existing user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'seconduser-duplicate@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const invitePayload = {
      email: 'seconduser-duplicate@e2e.com',
      role: Role.MEMBER,
    };

    // First invitation/membership succeeds
    await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/members`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .set('x-org-id', organization.id)
      .send(invitePayload)
      .expect(201);

    // Same user cannot be added again
    await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/members`)
      .set('Authorization', `Bearer ${firstUserToken}`)
      .set('x-org-id', organization.id)
      .send(invitePayload)
      .expect(409);
  });
});
