import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from './helpers/create-e2e-app';
import {
  AuthResponse,
  OrganizationResponse,
  ProjectResponse,
  TaskResponse,
} from './helpers/interface-e2e';

describe('Tasks (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('User cannot access another organization resources', async () => {
    // User A + Organization A
    const userAResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'tenant-isolation-a@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: userAToken } = userAResponse.body as AuthResponse;

    const organizationAResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Tenant Isolation Organization A',
      })
      .expect(201);

    const organizationA = organizationAResponse.body as OrganizationResponse;

    const projectAResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${userAToken}`)
      .set('x-org-id', organizationA.id)
      .send({
        name: 'Project A',
      })
      .expect(201);

    const projectA = projectAResponse.body as ProjectResponse;

    const taskAResponse = await request(app.getHttpServer())
      .post(`/projects/${projectA.id}/tasks`)
      .set('Authorization', `Bearer ${userAToken}`)
      .set('x-org-id', organizationA.id)
      .send({
        title: 'Task A',
      })
      .expect(201);

    const taskA = taskAResponse.body as TaskResponse;

    // User B + Organization B
    const userBResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'tenant-isolation-b@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: userBToken } = userBResponse.body as AuthResponse;

    const organizationBResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        name: 'Tenant Isolation Organization B',
      })
      .expect(201);

    const organizationB = organizationBResponse.body as OrganizationResponse;

    const projectBResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationB.id)
      .send({
        name: 'Project B',
      })
      .expect(201);

    const projectB = projectBResponse.body as ProjectResponse;

    await request(app.getHttpServer())
      .post(`/projects/${projectB.id}/tasks`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationB.id)
      .send({
        title: 'Task B',
      })
      .expect(201);

    // User B can access their own resources
    await request(app.getHttpServer())
      .get(`/projects/${projectB.id}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationB.id)
      .expect(200);

    // User B cannot access Organization A resources

    // GET Project A
    await request(app.getHttpServer())
      .get(`/projects/${projectA.id}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationB.id)
      .expect(404);

    // UPDATE Project A
    await request(app.getHttpServer())
      .patch(`/projects/${projectA.id}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationB.id)
      .send({
        name: 'Hacked Project',
      })
      .expect(404);

    // GET Task A
    await request(app.getHttpServer())
      .get(`/tasks/${taskA.id}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationB.id)
      .expect(404);

    // UPDATE Task A
    await request(app.getHttpServer())
      .patch(`/tasks/${taskA.id}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationB.id)
      .send({
        title: 'Hacked Task',
      })
      .expect(404);
  });

  it('User cannot access another organization by spoofing the organization header', async () => {
    // User A
    const userAResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'userA@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: userAToken } = userAResponse.body as AuthResponse;

    const organizationAResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Organization A',
      })
      .expect(201);

    const organizationA = organizationAResponse.body as OrganizationResponse;

    const projectAResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${userAToken}`)
      .set('x-org-id', organizationA.id)
      .send({
        name: 'Project A',
      })
      .expect(201);

    const projectA = projectAResponse.body as ProjectResponse;
    // User B
    const userBResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'userB@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: userBToken } = userBResponse.body as AuthResponse;

    await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        name: 'Organization B',
      })
      .expect(201);

    // User B sends Organization A's ID.

    await request(app.getHttpServer())
      .get(`/projects/${projectA.id}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationA.id)
      .expect(403);
  });
});
