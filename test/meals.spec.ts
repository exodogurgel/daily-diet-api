import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
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

  it('should be able to create a new meal', async () => {
    await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@email.com',
      password: '123456',
    })

    const userAuthenticatedResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'john@email.com',
        password: '123456',
      })

    const cookies = userAuthenticatedResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Salad',
        description: 'complete meal',
        dietStatus: 'in_diet',
      })
      .expect(201)
  })

  it('should be able to update a specific meal', async () => {
    await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@email.com',
      password: '123456',
    })

    const userAuthenticatedResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'john@email.com',
        password: '123456',
      })

    const cookies = userAuthenticatedResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Salad',
        description: 'complete meal',
        dietStatus: 'in_diet',
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Salad updated',
        description: 'complete meal updated',
        dietStatus: 'out_diet',
      })
      .expect(200)
  })

  it('should be able to list all meals', async () => {
    await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@email.com',
      password: '123456',
    })

    const userAuthenticatedResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'john@email.com',
        password: '123456',
      })

    const cookies = userAuthenticatedResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Salad',
        description: 'complete meal',
        dietStatus: 'in_diet',
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Salad',
        description: 'complete meal',
        diet_status: 'in_diet',
      }),
    ])
  })

  it('should be able to get a specific meal', async () => {
    await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@email.com',
      password: '123456',
    })

    const userAuthenticatedResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'john@email.com',
        password: '123456',
      })

    const cookies = userAuthenticatedResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Salad',
        description: 'complete meal',
        dietStatus: 'in_diet',
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Salad',
        description: 'complete meal',
        diet_status: 'in_diet',
      }),
    )
  })

  it('should be able to delete a specific meal', async () => {
    await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@email.com',
      password: '123456',
    })

    const userAuthenticatedResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'john@email.com',
        password: '123456',
      })

    const cookies = userAuthenticatedResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Salad',
        description: 'complete meal',
        dietStatus: 'in_diet',
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it('should be able to get the summary', async () => {
    await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@email.com',
      password: '123456',
    })

    const userAuthenticatedResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'john@email.com',
        password: '123456',
      })

    const cookies = userAuthenticatedResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Salad',
      description: 'complete meal',
      dietStatus: 'in_diet',
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Burger',
      description: 'complete meal',
      dietStatus: 'out_diet',
    })

    const summaryResponse = await request(app.server)
      .get('/meals/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      mealsInDiet: 1,
      mealsOutDiet: 1,
      totalMeals: 2,
      maxPositiveSequence: 1,
    })
  })
})
