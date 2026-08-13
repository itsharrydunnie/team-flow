import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from './helpers/create-e2e-app';
import { Role } from 'src/organizations/org.enum';
import {
  AuthResponse,
  OrganizationResponse,
  ProjectResponse,
} from './helpers/interface-e2e';

describe('Organization Permissions (e2e) Focusing on one Permission, e.g. PROJECT_CREATE', () => {
  let app: INestApplication;

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

    const { accessToken: ownerToken } = owner.body as AuthResponse;

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Permission Test Organization',
      })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organization.id)
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

    const { accessToken: ownerToken } = owner.body as AuthResponse;

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Admin Permission Organization',
      })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    const admin = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: adminToken } = admin.body as AuthResponse;

    await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organization.id)
      .send({
        email: 'admin@e2e.com',
        role: Role.ADMIN,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-org-id', organization.id)
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

    const { accessToken: ownerToken } = owner.body as AuthResponse;

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Member Permission Organization',
      })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    const member = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'member@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: memberToken } = member.body as AuthResponse;

    await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organization.id)
      .send({
        email: 'member@e2e.com',
        role: Role.MEMBER,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${memberToken}`)
      .set('x-org-id', organization.id)
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

    const { accessToken: ownerToken } = owner.body as AuthResponse;

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Member Task Organization',
      })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organization.id)
      .send({
        name: 'Member Project',
      })
      .expect(201);

    const project = projectResponse.body as ProjectResponse;

    const member = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'member-task@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: memberToken } = member.body as AuthResponse;

    await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organization.id)
      .send({
        email: 'member-task@e2e.com',
        role: Role.MEMBER,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${memberToken}`)
      .set('x-org-id', organization.id)
      .send({
        title: 'Member Task',
      })
      .expect(201);
  });
});
