import { INestApplication } from '@nestjs/common';
import { createE2EApp } from './helpers/create-e2e-app';
import { App } from 'supertest/types';
import request from 'supertest';

describe('Projects (e2e)', () => {
  let app: INestApplication<App>;

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

    const accessToken = user.body.accessToken;

    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Project Organization',
      })
      .expect(201);

    const organizationId = organization.body.organization.id;

    await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-org-id', organizationId)
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

    const accessToken = user.body.accessToken;

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
    const owner = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'project-owner-nonmember@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const ownerToken = owner.body.accessToken;

    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Project Access Organization',
      })
      .expect(201);

    const organizationId = organization.body.organization.id;

    const project = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organizationId)
      .send({
        name: 'Private Project',
      })
      .expect(201);

    const projectId = project.body.id;

    // User 2 is authenticated but not a member
    const nonMember = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'project-nonmember@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const nonMemberToken = nonMember.body.accessToken;

    await request(app.getHttpServer())
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .set('x-org-id', organizationId)
      .expect(403);
  });

  it('User from another organization cannot access project', async () => {
    // User 1 creates Organization A
    const userOne = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'org-a-user@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const userOneToken = userOne.body.accessToken;

    const organizationA = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        name: 'Organization A',
      })
      .expect(201);

    const organizationAId = organizationA.body.organization.id;

    // Organization A has the project
    const project = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('x-org-id', organizationAId)
      .send({
        name: 'Organization A Project',
      })
      .expect(201);

    const projectId = project.body.id;

    // User 2 creates Organization B
    const userTwo = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'org-b-user@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const userTwoToken = userTwo.body.accessToken;

    const organizationB = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userTwoToken}`)
      .send({
        name: 'Organization B',
      })
      .expect(201);

    const organizationBId = organizationB.body.organization.id;

    // User from Organization B attempts to access
    // a project belonging to Organization A.
    await request(app.getHttpServer())
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${userTwoToken}`)
      .set('x-org-id', organizationBId)
      .expect(404);
  });
});
