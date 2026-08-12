import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2EApp } from './helpers/create-e2e-app';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const registerUrl = '/auth/register';
  const loginUrl = '/auth/login';
  const meUrl = '/auth/me';

  describe('Registration Auth (e2e)', () => {
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

  describe('Login Auth (e2e)', () => {
    it('/auth/login (POST) - Successfuly Login With Valid Credentials', () => {
      return request(app.getHttpServer())
        .post(loginUrl)
        .send({ email: 'test@e2e.com', password: 'Testpassword#1' })
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          });
        });
    });

    it('/auth/login (POST) - Wrong Password', () => {
      return request(app.getHttpServer())
        .post(loginUrl)
        .send({ email: 'test@e2e.com', password: 'Wrongpassword#1' })
        .expect(401);
    });

    it('/auth/login (POST) - Invalid Email', () => {
      return request(app.getHttpServer())
        .post(loginUrl)
        .send({ email: 'wrong@e2e.com', password: 'Wrongpassword#1' })
        .expect(401);
    });
  });

  describe('Auth Me', () => {
    it('/auth/me (GET) - Valid Access ', async () => {
      // First login
      const logInResponse = await request(app.getHttpServer())
        .post(loginUrl)
        .send({ email: 'test@e2e.com', password: 'Testpassword#1' });
      const accessToken = logInResponse.body.accessToken;

      // Retrieve current user data
      return request(app.getHttpServer())
        .get(meUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });
});
