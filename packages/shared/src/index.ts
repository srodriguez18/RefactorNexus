export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  user: { id: number; username: string; isAdmin: boolean }
}

export type TokenPayload = {
  userId: number
  username: string
  isAdmin: boolean
}
