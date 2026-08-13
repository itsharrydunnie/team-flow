import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from './helpers/create-e2e-app';
import { Role } from 'src/organizations/org.enum';
import { TaskStatus } from 'src/tasks/tasks.enum';
import {
  AuthResponse,
  MeResponse,
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

  it('Authenticated org member can create a task under a project', async () => {
    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'task-owner@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken } = userResponse.body as AuthResponse;
    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Task Organization',
      })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-org-id', organization.id)
      .send({
        name: 'Task Project',
      })
      .expect(201);

    const project = projectResponse.body as ProjectResponse;

    await request(app.getHttpServer())
      .post(`/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-org-id', organization.id)
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

    const { accessToken: ownerToken } = owner.body as AuthResponse;

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Task Assign Organization',
      })
      .expect(201);

    const organization = organizationResponse.body as OrganizationResponse;

    const assignee = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'task-assignee@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: assigneeToken } = assignee.body as AuthResponse;

    const assigneeMeResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${assigneeToken}`)
      .expect(200);

    const user = assigneeMeResponse.body as MeResponse;

    await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organization.id)
      .send({
        email: 'task-assignee@e2e.com',
        role: Role.MEMBER,
      })
      .expect(201);

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organization.id)
      .send({
        name: 'Assignment Project',
      })
      .expect(201);

    const project = projectResponse.body as ProjectResponse;

    const taskResponse = await request(app.getHttpServer())
      .post(`/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organization.id)
      .send({
        title: 'Assignment Task',
      })
      .expect(201);

    const task = taskResponse.body as TaskResponse;

    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-org-id', organization.id)
      .send({
        assigneeId: user.id,
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}/status`)
      .set('Authorization', `Bearer ${assigneeToken}`)
      .set('x-org-id', organization.id)
      .send({
        status: TaskStatus.IN_PROGRESS,
      })
      .expect(200);
  });

  it('User cannot access a task from another organization', async () => {
    // Organization A
    const userAResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'task-org-a@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: tokenA } = userAResponse.body as AuthResponse;

    const organizationAResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Task Organization A',
      })
      .expect(201);

    const organizationA = organizationAResponse.body as OrganizationResponse;

    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-org-id', organizationA.id)
      .send({
        name: 'Organization A Project',
      })
      .expect(201);

    const project = projectResponse.body as ProjectResponse;

    const taskResponse = await request(app.getHttpServer())
      .post(`/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-org-id', organizationA.id)
      .send({
        title: 'Organization A Task',
      })
      .expect(201);

    const task = taskResponse.body as TaskResponse;

    // Organization B
    const userBResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'task-org-b@e2e.com',
        password: 'Testpassword#1',
      })
      .expect(201);

    const { accessToken: tokenB } = userBResponse.body as AuthResponse;

    const organizationBResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        name: 'Task Organization B',
      })
      .expect(201);

    const organizationB = organizationBResponse.body as OrganizationResponse;

    // User B tries to update a task belonging to Organization A.
    await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-org-id', organizationB.id)
      .send({
        title: 'Organization A Task Title Update',
      })
      .expect(404);
  });
});
