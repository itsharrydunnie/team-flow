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

  it('Authenticated org member can create a task under a project', async () => {
    const user = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'task-owner@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const accessToken = user.body.accessToken;

    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Task Organization',
      })
      .expect(201);

    const organizationId = organization.body.organization.id;

    const project = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-org-id', organizationId)
      .send({
        name: 'Task Project',
      })
      .expect(201);

    const projectId = project.body.id;

    await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-org-id', organizationId)
      .send({
        title: 'Test Task',
        description: 'Test task description',
      })
      .expect(201);
  });

  it('User can assign a task and User assigned task can update task status', async () => {
    const owner = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'task-assign-owner@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const ownerToken = owner.body.accessToken;

    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Task Assign Organization',
      })
      .expect(201);

    const organizationId = organization.body.organization.id;

    const assignee = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'task-assignee@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const assigneeToken = assignee.body.accessToken;

    const assigneeMe = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${assigneeToken}`)
      .expect(200);

    const assigneeId = assigneeMe.body.id;

    await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organizationId)
      .send({
        email: 'task-assignee@e2e.com',
        role: Role.MEMBER,
      })
      .expect(201);

    const project = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organizationId)
      .send({
        name: 'Assignment Project',
      })
      .expect(201);

    const projectId = project.body.id;

    const task = await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organizationId)
      .send({
        title: 'Assignment Task',
      })
      .expect(201);

    const taskId = task.body.id;

    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organizationId)
      .send({
        assigneeId,
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${assigneeToken}`)
      .set('x-org-id', organizationId)
      .send({
        status: TaskStatus.IN_PROGRESS,
      })
      .expect(200);
  });

  it('User cannot access a task from another organization', async () => {
    // Organization A
    const userA = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'task-org-a@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const tokenA = userA.body.accessToken;

    const organizationA = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Task Organization A',
      })
      .expect(201);

    const organizationAId = organizationA.body.organization.id;

    const project = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-org-id', organizationAId)
      .send({
        name: 'Organization A Project',
      })
      .expect(201);

    const projectId = project.body.id;

    const task = await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-org-id', organizationAId)
      .send({
        title: 'Organization A Task',
      })
      .expect(201);

    const taskId = task.body.id;

    // Organization B
    const userB = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'task-org-b@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const tokenB = userB.body.accessToken;

    const organizationB = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        name: 'Task Organization B',
      })
      .expect(201);

    const organizationBId = organizationB.body.organization.id;

    // User B tries to update a task belonging to Organization A.
    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-org-id', organizationBId)
      .send({
        title: 'Organization A Task Title Update',
      })
      .expect(404);
  });
});
