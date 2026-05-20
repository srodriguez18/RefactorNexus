import type { PrismaClient } from '@prisma/client'
import type { IUserRepository, UserWithHash } from '../domain/IUserRepository.js'
import type { User } from '../domain/User.js'

export class UserRepositoryPrisma implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUsername(username: string): Promise<UserWithHash | null> {
    const row = await this.prisma.user.findUnique({ where: { username } })
    if (!row) return null
    return { id: row.id, username: row.username, isAdmin: row.isAdmin, password: row.password }
  }

  async findById(id: number): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } })
    if (!row) return null
    return { id: row.id, username: row.username, isAdmin: row.isAdmin }
  }

  async listAllIds(): Promise<number[]> {
    const rows = await this.prisma.user.findMany({ select: { id: true } })
    return rows.map((r) => r.id)
  }
}
