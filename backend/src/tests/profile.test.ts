import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../app';
import { prisma } from '../lib/prisma';

describe('Profile & Geographic Discovery Integration Tests (Sprint 1)', () => {
  let tokenUser1: string;
  let userId1: string;
  let tokenUser2: string;
  let userId2: string;
  let photoId: string;

  const testUser1 = {
    nombre: 'Jugador Obelisco',
    email: `obelisco.${Date.now()}@playconnect.com`,
    password: 'Password123!',
  };

  const testUser2 = {
    nombre: 'Jugador Cercano',
    email: `cercano.${Date.now()}@playconnect.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    // Register User 1
    const res1 = await request(app).post('/api/v1/auth/register').send(testUser1);
    tokenUser1 = res1.body.tokens.accessToken;
    userId1 = res1.body.user.id;

    // Register User 2
    const res2 = await request(app).post('/api/v1/auth/register').send(testUser2);
    tokenUser2 = res2.body.tokens.accessToken;
    userId2 = res2.body.user.id;
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({
      where: { email: { contains: 'playconnect.com' } },
    });
    await prisma.$disconnect();
  });

  describe('HU-01: Profile & Sports Editing', () => {
    it('should update user profile name and search radius', async () => {
      const res = await request(app)
        .put('/api/v1/profile/me')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({ nombre: 'Carlos Obelisco', radio_busqueda_km: 10 });

      expect(res.status).toBe(200);
      expect(res.body.user.nombre).toBe('Carlos Obelisco');
      expect(res.body.user.radio_busqueda_km).toBe(10);
    });

    it('should add a sports profile with position and skill level', async () => {
      const res = await request(app)
        .put('/api/v1/profile/sports')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({ deporte: 'FUTBOL', posicion: 'DELANTERO', nivel: 'AVANZADO' });

      expect(res.status).toBe(200);
      expect(res.body.sport.deporte).toBe('FUTBOL');
      expect(res.body.sport.posicion).toBe('DELANTERO');
      expect(res.body.sport.nivel).toBe('AVANZADO');
    });

    it('should fetch full profile by id', async () => {
      const res = await request(app)
        .get(`/api/v1/profile/${userId1}`)
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.profile.nombre).toBe('Carlos Obelisco');
      expect(res.body.profile.perfiles_deportivos).toHaveLength(1);
    });
  });

  describe('HU-02: Photo Gallery Upload', () => {
    it('should upload a photo to gallery', async () => {
      const dummyImagePath = path.join(__dirname, 'test-image.jpg');
      fs.writeFileSync(dummyImagePath, 'fake image buffer content');

      const res = await request(app)
        .post('/api/v1/profile/photos')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .attach('foto', dummyImagePath);

      fs.unlinkSync(dummyImagePath);

      expect(res.status).toBe(201);
      expect(res.body.photo).toHaveProperty('id');
      expect(res.body.photo.url).toMatch(/\/uploads\/img-/);
      photoId = res.body.photo.id;
    });

    it('should delete uploaded photo from gallery', async () => {
      const res = await request(app)
        .delete(`/api/v1/profile/photos/${photoId}`)
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/eliminada/i);
    });
  });

  describe('HU-05 & HU-06: PostGIS Activation & Proximity Search', () => {
    it('should update User 2 location and activate FUTBOL online', async () => {
      // User 2 located at Lat: -34.6100, Lng: -58.3900 (~1.1 km away from Obelisco)
      const resLoc = await request(app)
        .put('/api/v1/profile/location')
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({ latitude: -34.6100, longitude: -58.3900 });

      expect(resLoc.status).toBe(200);

      const resAct = await request(app)
        .put('/api/v1/profile/activation')
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({ deporte: 'FUTBOL', activo: true });

      expect(resAct.status).toBe(200);
      expect(resAct.body.sport.activo).toBe(true);
    });

    it('should find User 2 within 5km radius from User 1 coordinates with PostGIS', async () => {
      // User 1 at Obelisco (-34.6037, -58.3816)
      const res = await request(app)
        .get('/api/v1/profile/nearby')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .query({
          deporte: 'FUTBOL',
          latitude: -34.6037,
          longitude: -58.3816,
          radiusKm: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.players).toHaveLength(1);
      expect(res.body.players[0].id).toBe(userId2);
      expect(res.body.players[0].distancia_km).toBeGreaterThan(0.5);
      expect(res.body.players[0].distancia_km).toBeLessThan(3.0);
      // Privacy Check: Coordinates must NOT be returned in result
      expect(res.body.players[0]).not.toHaveProperty('latitude');
      expect(res.body.players[0]).not.toHaveProperty('longitude');
      expect(res.body.players[0]).not.toHaveProperty('ubicacion');
    });

    it('should NOT return User 2 when User 2 deactivates online status', async () => {
      await request(app)
        .put('/api/v1/profile/activation')
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({ deporte: 'FUTBOL', activo: false });

      const res = await request(app)
        .get('/api/v1/profile/nearby')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .query({
          deporte: 'FUTBOL',
          latitude: -34.6037,
          longitude: -58.3816,
          radiusKm: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.players).toHaveLength(0);
    });
  });
});
