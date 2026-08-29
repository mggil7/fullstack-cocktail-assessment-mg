import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { ElasticSearch } from '../src/elasticsearch.service';

describe('Cocktails API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const uniqueTitle = `Test Cocktail ${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ElasticSearch)
      .useValue({})
      .compile();

    app = configureApp(moduleFixture.createNestApplication());
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.query('DELETE FROM cocktails WHERE title = $1', [
        uniqueTitle,
      ]);
    }
    if (app) {
      await app.close();
    }
  });

  describe('GET /cocktails', () => {
    it('returns the seeded cocktail list', async () => {
      const res = await request(app.getHttpServer())
        .get('/cocktails')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const nojito = res.body.find((c) => c.title === 'Nojito');
      expect(nojito).toBeDefined();
      expect(typeof nojito.price).toBe('number');
    });

    it('filters by description, case-insensitively', async () => {
      const res = await request(app.getHttpServer())
        .get('/cocktails')
        .query({ search: 'MINT' })
        .expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      for (const cocktail of res.body) {
        expect(cocktail.description.toLowerCase()).toContain('mint');
      }
    });

    it('returns an empty array when nothing matches', async () => {
      const res = await request(app.getHttpServer())
        .get('/cocktails')
        .query({ search: 'zzz-no-such-description' })
        .expect(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /cocktails/:id', () => {
    it('returns a single cocktail with all fields', async () => {
      const list = await request(app.getHttpServer())
        .get('/cocktails')
        .expect(200);
      const first = list.body[0];

      const res = await request(app.getHttpServer())
        .get(`/cocktails/${first.id}`)
        .expect(200);
      expect(res.body).toMatchObject({ id: first.id, title: first.title });
      expect(res.body).toHaveProperty('description');
      expect(res.body).toHaveProperty('glassType');
    });

    it('returns 404 for a missing id', async () => {
      const res = await request(app.getHttpServer())
        .get('/cocktails/999999')
        .expect(404);
      expect(res.body.message).toContain('not found');
    });

    it('returns 400 for a non-numeric id', () => {
      return request(app.getHttpServer()).get('/cocktails/abc').expect(400);
    });
  });

  describe('POST /cocktails', () => {
    it('creates a cocktail and returns it with an id', async () => {
      const res = await request(app.getHttpServer())
        .post('/cocktails')
        .send({
          title: uniqueTitle,
          description: 'Created by the integration test suite.',
          glassType: 'Highball',
          price: 6.5,
        })
        .expect(201);
      expect(res.body.id).toBeGreaterThan(0);
      expect(res.body.title).toBe(uniqueTitle);
      expect(res.body.price).toBe(6.5);
    });

    it('returns 409 when the title already exists (e.g. a second Nojito)', async () => {
      const res = await request(app.getHttpServer())
        .post('/cocktails')
        .send({
          title: 'Nojito',
          description: 'Duplicate of the seeded Nojito.',
          price: 4.5,
        })
        .expect(409);
      expect(res.body.message).toContain('already exists');
    });

    it('returns 400 with messages when validation fails', async () => {
      const res = await request(app.getHttpServer())
        .post('/cocktails')
        .send({ title: '', price: -3 })
        .expect(400);
      expect(Array.isArray(res.body.message)).toBe(true);
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });
});
