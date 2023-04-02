import { FastifyInstance } from 'fastify'
import { compare } from 'bcryptjs'
import { knex } from '../database'
import { z } from 'zod'

export async function sessionsRoutes(app: FastifyInstance) {
  app.post('/sessions', async (request, reply) => {
    const createUserBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = createUserBodySchema.parse(request.body)

    const user = await knex('users')
      .where('email', email)
      .first()
      .select('id', 'email', 'password')

    if (!user?.email) {
      throw new Error('E-mail and/or password wrong')
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      throw new Error('E-mail and/or password wrong')
    }

    return reply
      .status(200)
      .cookie('userId', user.id, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 12, // 12 hours
      })
      .send()
  })
}
