import type { User } from './User.js'

export interface UserWithHash extends User {
  password: string
}

export interface IUserRepository {
  findByUsername(username: string): Promise<UserWithHash | null>
  findById(id: number): Promise<User | null>
  listAllIds(): Promise<number[]>
}
