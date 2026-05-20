import type { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import type { TokenPayload } from '@legacy-nexus/shared'

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload
  }
}

export async function verifyToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token requerido' })
  }

  const token = authHeader.slice(7)
  const secret = process.env['JWT_SECRET'] ?? ''

  try {
    request.user = jwt.verify(token, secret) as TokenPayload
  } catch {
    return reply.status(401).send({ error: 'Token inválido' })
  }
}

export async function verifyAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await verifyToken(request, reply)
  if (reply.sent) return

  if (!request.user?.isAdmin) {
    return reply.status(403).send({ error: 'Acceso denegado' })
  }
}
