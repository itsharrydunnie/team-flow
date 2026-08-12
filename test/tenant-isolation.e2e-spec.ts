import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { createE2EApp } from './helpers/create-e2e-app';
import { Role } from 'src/organizations/org.enum';
import { TaskStatus } from 'src/tasks/tasks.enum';

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('User cannot access another organization resources', async () => {
    // User A + Organization A
    const userA = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'tenant-isolation-a@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const userAToken = userA.body.accessToken;

    const organizationA = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Tenant Isolation Organization A',
      })
      .expect(201);

    const organizationAId = organizationA.body.organization.id;

    const projectA = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${userAToken}`)
      .set('x-org-id', organizationAId)
      .send({
        name: 'Project A',
      })
      .expect(201);

    const projectAId = projectA.body.id;

    const taskA = await request(app.getHttpServer())
      .post(`/projects/${projectAId}/tasks`)
      .set('Authorization', `Bearer ${userAToken}`)
      .set('x-org-id', organizationAId)
      .send({
        title: 'Task A',
      })
      .expect(201);

    const taskAId = taskA.body.id;

    // User B + Organization B
    const userB = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'tenant-isolation-b@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const userBToken = userB.body.accessToken;

    const organizationB = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        name: 'Tenant Isolation Organization B',
      })
      .expect(201);

    const organizationBId = organizationB.body.organization.id;

    const projectB = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationBId)
      .send({
        name: 'Project B',
      })
      .expect(201);

    const projectBId = projectB.body.id;

    const taskB = await request(app.getHttpServer())
      .post(`/projects/${projectBId}/tasks`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationBId)
      .send({
        title: 'Task B',
      })
      .expect(201);

    const taskBId = taskB.body.id;

    // User B can access their own resources
    await request(app.getHttpServer())
      .get(`/projects/${projectBId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationBId)
      .expect(200);

    // User B cannot access Organization A resources

    // GET Project A
    await request(app.getHttpServer())
      .get(`/projects/${projectAId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationBId)
      .expect(404);

    // UPDATE Project A
    await request(app.getHttpServer())
      .patch(`/projects/${projectAId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationBId)
      .send({
        name: 'Hacked Project',
      })
      .expect(404);

    // GET Task A
    await request(app.getHttpServer())
      .get(`/tasks/${taskAId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationBId)
      .expect(404);

    // UPDATE Task A
    await request(app.getHttpServer())
      .patch(`/tasks/${taskAId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationBId)
      .send({
        title: 'Hacked Task',
      })
      .expect(404);
  });

  it('User cannot access another organization by spoofing the organization header', async () => {
    // User A
    const userA = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'userA@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const userAToken = userA.body.accessToken;

    const organizationA = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Organization A',
      })
      .expect(201);

    const organizationAId = organizationA.body.organization.id;

    const projectA = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${userAToken}`)
      .set('x-org-id', organizationAId)
      .send({
        name: 'Project A',
      })
      .expect(201);

    const projectAId = projectA.body.id;

    // User B
    const userB = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'userB@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const userBToken = userB.body.accessToken;

    const organizationB = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        name: 'Organization B',
      })
      .expect(201);

    const organizationBId = organizationB.body.organization.id;

    // User B sends Organization A's ID.

    await request(app.getHttpServer())
      .get(`/projects/${projectAId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-org-id', organizationAId)
      .expect(403);
  });
});
