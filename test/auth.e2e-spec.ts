import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2EApp } from './helpers/create-e2e-app';

describe('Registration Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  // Regitstration
  const registerUrl = '/auth/register';

  //valid registration if email and password meet requirements
  it('/auth/register (POST) - successfull', () => {
    return request(app.getHttpServer())
      .post(registerUrl)
      .send({ email: 'test@e2e.com', password: 'Testpassword#1' })
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });
      });
  });

  it('/auth/register (POST) - invalid email', () => {
    return request(app.getHttpServer())
      .post(registerUrl)
      .send({ email: 'test@bademail', password: 'Testpassword#1' })
      .expect(400);
  });

  it('/auth/register (POST) - invalid password', () => {
    return request(app.getHttpServer())
      .post(registerUrl)
      .send({ email: 'test@goodemail.com', password: 'weakPassword' })
      .expect(400);
  });

  it('/auth/register (POST) - duplicate email', () => {
    return request(app.getHttpServer())
      .post(registerUrl)
      .send({ email: 'test@e2e.com', password: 'Testpassword#1' })
      .expect(409);
  });
});
