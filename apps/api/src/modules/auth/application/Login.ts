import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { IUserRepository } from '../domain/IUserRepository.js'
import type { User } from '../domain/User.js'

export class Login {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly jwtSecret: string,
  ) {}

  async execute(params: { username: string; password: string }): Promise<{
    token: string
    user: User
  }> {
    const userWithHash = await this.userRepo.findByUsername(params.username)

    if (!userWithHash) {
      throw new Error('Credenciales inválidas')
    }

    const passwordMatch = await bcrypt.compare(params.password, userWithHash.password)

    if (!passwordMatch) {
      throw new Error('Credenciales inválidas')
    }

    const user: User = {
      id: userWithHash.id,
      username: userWithHash.username,
      isAdmin: userWithHash.isAdmin,
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, isAdmin: user.isAdmin },
      this.jwtSecret,
      { expiresIn: '8h' },
    )

    return { token, user }
  }
}
