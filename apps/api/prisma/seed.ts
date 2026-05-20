import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hash, isAdmin: true },
  })

  await prisma.user.upsert({
    where: { username: 'cajero' },
    update: {},
    create: { username: 'cajero', password: await bcrypt.hash('cajero123', 10), isAdmin: false },
  })

  console.log('Seed completado: admin / cajero')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
