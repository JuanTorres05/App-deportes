import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';

describe('Auth Module Integration Tests (HU-31)', () => {
  const testUser = {
    nombre: 'Valentin Test',
    email: `test.${Date.now()}@playconnect.com`,
    password: 'Password123!',
  };

  let accessToken: string;
  let refreshToken: string;

  afterAll(async () => {
    // Clean up test user
    await prisma.usuario.deleteMany({
      where: { email: { contains: 'playconnect.com' } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully and return tokens', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email.toLowerCase());
      expect(response.body.user.nombre).toBe(testUser.nombre);
      expect(response.body.user).not.toHaveProperty('password_hash');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');

      accessToken = response.body.tokens.accessToken;
      refreshToken = response.body.tokens.refreshToken;
    });

    it('should reject registration if email is already registered', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/ya está registrado/i);
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/validación/i);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should log in successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/inválidas/i);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile with valid Bearer token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email.toLowerCase());
    });

    it('should reject request without Authorization header', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should issue new tokens when providing a valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });
  });
});
