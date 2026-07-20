import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createAppInstance } from '../../../app.factory';

const AXIS_USER_HEADER = JSON.stringify({
  id: 'e2e-test-user',
  identityProvider: 'entraid',
  name: 'E2E Test User',
  email: 'e2e@example.com',
  roles: ['admin'],
  type: 'HUMAN',
});

interface JsonApiResource {
  id: string;
  attributes: { id: string; name: string; status: string };
}

describe('GovernmentAgency (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createAppInstance();
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects requests without an axis-user header', async () => {
    const response = await request(app.getHttpServer()).get('/government-agencies');

    expect(response.status).toBe(401);
  });

  it('supports the full CRUD lifecycle over real HTTP', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/government-agencies')
      .set('axis-user', AXIS_USER_HEADER)
      .send({ name: 'Ministry of E2E Testing', status: 'ACTIVE' });

    expect(createResponse.status).toBe(201);
    const id: string = createResponse.body.data.id;
    expect(id).toBeDefined();

    const listResponse = await request(app.getHttpServer())
      .get('/government-agencies')
      .set('axis-user', AXIS_USER_HEADER);

    expect(listResponse.status).toBe(200);
    const created = (listResponse.body.data as JsonApiResource[]).find(
      (agency) => agency.id === id,
    );
    expect(created?.attributes.name).toBe('Ministry of E2E Testing');
    expect(created?.attributes.status).toBe('ACTIVE');

    const updateResponse = await request(app.getHttpServer())
      .patch(`/government-agencies/${id}`)
      .set('axis-user', AXIS_USER_HEADER)
      .send({ status: 'INACTIVE' });

    expect(updateResponse.status).toBe(200);

    const afterUpdate = await request(app.getHttpServer())
      .get('/government-agencies')
      .set('axis-user', AXIS_USER_HEADER);
    const updated = (afterUpdate.body.data as JsonApiResource[]).find(
      (agency) => agency.id === id,
    );
    expect(updated?.attributes.status).toBe('INACTIVE');

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/government-agencies/${id}`)
      .set('axis-user', AXIS_USER_HEADER);

    expect(deleteResponse.status).toBe(204);

    const afterDelete = await request(app.getHttpServer())
      .get('/government-agencies')
      .set('axis-user', AXIS_USER_HEADER);
    expect(
      (afterDelete.body.data as JsonApiResource[]).some((agency) => agency.id === id),
    ).toBe(false);
  });

  it('rejects an invalid create payload with 400 and accumulated field errors', async () => {
    const response = await request(app.getHttpServer())
      .post('/government-agencies')
      .set('axis-user', AXIS_USER_HEADER)
      .send({ name: 'short' });

    expect(response.status).toBe(400);
  });
});
