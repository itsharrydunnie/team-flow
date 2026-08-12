import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { createE2EApp } from './helpers/create-e2e-app';
import { Role } from 'src/organizations/org.enum';

describe('Organization Permissions (e2e) Focusing on one Permission, e.g. PROJECT_CREATE', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Owner can perform owner actions', async () => {
    const owner = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'owner@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const ownerToken = owner.body.accessToken;

    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Permission Test Organization',
      })
      .expect(201);

    const organizationId = organization.body.organization.id;

    await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organizationId)
      .send({
        name: 'Owner Project',
      })
      .expect(201);
  });

  it('Admin can perform admin actions', async () => {
    const owner = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'owner-admin@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const ownerToken = owner.body.accessToken;

    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Admin Permission Organization',
      })
      .expect(201);

    const organizationId = organization.body.organization.id;

    const admin = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const adminToken = admin.body.accessToken;

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organizationId)
      .send({
        email: 'admin@e2e.com',
        role: Role.ADMIN,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-org-id', organizationId)
      .send({
        name: 'Admin Project',
      })
      .expect(201);
  });

  it('Member is denied admin actions', async () => {
    const owner = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'owner-member@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const ownerToken = owner.body.accessToken;

    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Member Permission Organization',
      })
      .expect(201);

    const organizationId = organization.body.organization.id;

    const member = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'member@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const memberToken = member.body.accessToken;

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organizationId)
      .send({
        email: 'member@e2e.com',
        role: Role.MEMBER,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${memberToken}`)
      .set('x-org-id', organizationId)
      .send({
        name: 'Should Fail',
      })
      .expect(403);
  });

  it('Member can perform permitted member actions', async () => {
    const owner = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'owner-task@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const ownerToken = owner.body.accessToken;

    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Member Task Organization',
      })
      .expect(201);

    const organizationId = organization.body.organization.id;

    const project = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organizationId)
      .send({
        name: 'Member Project',
      })
      .expect(201);

    const projectId = project.body.id;

    const member = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'member-task@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const memberToken = member.body.accessToken;

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organizationId)
      .send({
        email: 'member-task@e2e.com',
        role: Role.MEMBER,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${memberToken}`)
      .set('x-org-id', organizationId)
      .send({
        title: 'Member Task',
      })
      .expect(201);
  });
});
