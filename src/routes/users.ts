import { FastifyInstance } from 'fastify'
import { hash } from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { z } from 'zod'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })

    const { email, name, password } = createUserBodySchema.parse(request.body)

    const hashedPassword = await hash(password, 8)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
    })

    return reply.status(201).send()
  })
}
