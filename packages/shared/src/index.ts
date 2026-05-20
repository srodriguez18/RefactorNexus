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

export type Product = {
  id: number
  sku: string
  name: string
  description: string | null
  price: number
  category: string | null
  supplierId: number | null
}

export type CreateProductDto = {
  sku: string
  name: string
  description?: string
  price: number
  category?: string
  supplierId?: number
}
