import { INestApplication } from '@nestjs/common';
import { createE2EApp } from './helpers/create-e2e-app';
import request from 'supertest';
import {
  AuthResponse,
  OrganizationResponse,
  ProjectResponse,
} from './helpers/interface-e2e';

describe('Projects (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Authenticated org member creates project', async () => {
    const user = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'project-owner@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken } = user.body as AuthResponse;

    const orgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Project Organization',
      })
      .expect(201);

    const organization = orgResponse.body as OrganizationResponse;

    await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-org-id', organization.id)
      .send({
        name: 'Test Project',
      })
      .expect(201);
  });

  it('Missing x-org-id returns 400', async () => {
    const user = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'project-no-org@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken } = user.body as AuthResponse;

    await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Project',
      })
      .expect(400);
  });

  it('Non-member cannot access project', async () => {
    // User 1 creates organization and project
    const ownerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'project-owner-nonmember@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: ownerToken } = ownerResponse.body as AuthResponse;

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Project Access Organization',
      })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organization.id)
      .send({
        name: 'Private Project',
      })
      .expect(201);

    const project = projectResponse.body as ProjectResponse;

    // User 2 is authenticated but not a member
    const nonMember = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'project-nonmember@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: nonMemberToken } = nonMember.body as AuthResponse;

    await request(app.getHttpServer())
      .get(`/projects/${project.id}`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .set('x-org-id', organization.id)
      .expect(403);
  });

  it('User from another organization cannot access project', async () => {
    // User 1 creates Organization A
    const userOneResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'org-a-user@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: userOneToken } = userOneResponse.body as AuthResponse;

    const organizationAResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        name: 'Organization A',
      })
      .expect(201);

    const organizationA = organizationAResponse.body as OrganizationResponse;

    // Organization A has the project
    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('x-org-id', organizationA.id)
      .send({
        name: 'Organization A Project',
      })
      .expect(201);

    const project = projectResponse.body as ProjectResponse;

    // User 2 creates Organization B
    const userTwoResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'org-b-user@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: userTwoToken } = userTwoResponse.body as AuthResponse;

    const organizationBResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userTwoToken}`)
      .send({
        name: 'Organization B',
      })
      .expect(201);

    const organizationB = organizationBResponse.body as OrganizationResponse;

    // User from Organization B attempts to access
    // a project belonging to Organization A.
    await request(app.getHttpServer())
      .get(`/projects/${project.id}`)
      .set('Authorization', `Bearer ${userTwoToken}`)
      .set('x-org-id', organizationB.id)
      .expect(404);
  });
});
