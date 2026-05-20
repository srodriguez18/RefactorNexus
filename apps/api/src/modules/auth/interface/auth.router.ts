import type { FastifyInstance } from 'fastify'
import type { LoginRequest, LoginResponse } from '@legacy-nexus/shared'
import { prisma } from '../../../lib/prisma.js'
import { Login } from '../application/Login.js'
import { UserRepositoryPrisma } from '../infrastructure/UserRepositoryPrisma.js'

export async function authRouter(app: FastifyInstance): Promise<void> {
  const userRepo = new UserRepositoryPrisma(prisma)
  const jwtSecret = process.env['JWT_SECRET'] ?? ''
  const login = new Login(userRepo, jwtSecret)

  app.post<{ Body: LoginRequest; Reply: LoginResponse | { error: string } }>(
    '/login',
    async (request, reply) => {
      try {
        const result = await login.execute(request.body)
        return reply.send(result)
      } catch {
        return reply.status(401).send({ error: 'Credenciales inválidas' })
      }
    },
  )
}
