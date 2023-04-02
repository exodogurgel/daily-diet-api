import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'
import { sessionsRoutes } from './routes/sessions'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(sessionsRoutes)

app.register(mealsRoutes, {
  prefix: 'meals',
})
