import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { z } from 'zod'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [checkUserIdExists] }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      dietStatus: z.enum(['in_diet', 'out_diet']),
    })

    const { name, description, dietStatus } = createMealBodySchema.parse(
      request.body,
    )

    const { userId } = request.cookies

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      diet_status: dietStatus,
      user_id: userId,
    })

    return reply.status(201).send()
  })

  app.put(
    '/:id',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const updateMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const updateMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        dietStatus: z.enum(['in_diet', 'out_diet']).optional(),
      })

      const { id } = updateMealParamsSchema.parse(request.params)

      const { name, description, dietStatus } = updateMealBodySchema.parse(
        request.body,
      )

      const { userId } = request.cookies

      const meal = await knex('meals').where({ id, user_id: userId }).first()

      if (!meal) {
        throw new Error('Meal not found')
      }

      meal.name = name ?? meal.name
      meal.description = description ?? meal.description
      meal.diet_status = dietStatus ?? meal.diet_status

      await knex('meals').where({ id }).update(meal)

      return reply.status(200).send()
    },
  )

  app.get('/', { preHandler: [checkUserIdExists] }, async (request) => {
    const { userId } = request.cookies

    const meals = await knex('meals').where('user_id', userId).select()

    return {
      meals,
    }
  })

  app.get('/:id', { preHandler: [checkUserIdExists] }, async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { userId } = request.cookies

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals').where({ user_id: userId, id }).first()

    return {
      meal,
    }
  })

  app.delete(
    '/:id',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { userId } = request.cookies

      const { id } = getMealParamsSchema.parse(request.params)

      await knex('meals').where({ user_id: userId, id }).delete()

      return reply.status(204).send()
    },
  )

  app.get('/summary', { preHandler: [checkUserIdExists] }, async (request) => {
    const { userId } = request.cookies

    const meals = await knex('meals').where('user_id', userId)

    const infoMeals = meals.reduce(
      (acc, meal) => {
        if (meal.diet_status === 'in_diet') {
          acc.mealsInDiet += 1
        } else {
          acc.mealsOutDiet += 1
        }

        acc.totalMeals += 1

        return acc
      },
      { mealsInDiet: 0, mealsOutDiet: 0, totalMeals: 0 },
    )

    function countMaxInDietSequence() {
      let maxSequence = 0
      let currentSequence = 0

      for (let i = 0; i < meals.length; i++) {
        const currentItem = meals[i]

        if (currentItem.diet_status === 'in_diet') {
          currentSequence++
          maxSequence = Math.max(maxSequence, currentSequence)
        } else {
          currentSequence = 0
        }
      }

      return maxSequence
    }

    const summary = {
      ...infoMeals,
      maxPositiveSequence: countMaxInDietSequence(),
    }

    // const maxPositiveSequence = countMaxInDietSequence()

    return {
      summary,
    }
  })
}
