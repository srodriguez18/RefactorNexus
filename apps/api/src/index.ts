import Fastify from 'fastify'
import cors from '@fastify/cors'
import { authRouter } from './modules/auth/interface/auth.router.js'

const app = Fastify({ logger: true })

await app.register(cors)

app.get('/health', async () => {
  return { status: 'ok' }
})

await app.register(authRouter, { prefix: '/api/auth' })

try {
  await app.listen({ port: 3000, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
