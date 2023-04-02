import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John',
        email: 'john@example.com',
        password: '123456',
      })
      .expect(201)
  })

  it('should be able to authenticated a user', async () => {
    await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@email.com',
      password: '123456',
    })

    await request(app.server)
      .post('/sessions')
      .send({
        email: 'john@email.com',
        password: '123456',
      })
      .expect(200)
  })
})
