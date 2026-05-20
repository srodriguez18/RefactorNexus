import { describe, test, expect, vi, beforeEach } from 'vitest'
import { Login } from './Login.js'

vi.mock('bcrypt', () => ({ default: { compare: vi.fn() } }))
vi.mock('jsonwebtoken', () => ({ default: { sign: vi.fn(() => 'test-token') } }))

import bcrypt from 'bcrypt'

const mockUserRepo = { findByUsername: vi.fn() }
const JWT_SECRET = 'test-secret'

beforeEach(() => vi.clearAllMocks())

const makeUserWithHash = (overrides = {}) => ({
  id: 1,
  username: 'admin',
  isAdmin: true,
  password: '$2b$hashed',
  ...overrides,
})

describe('Login', () => {
  const uc = new Login(mockUserRepo as any, JWT_SECRET)

  test('lanza error si el usuario no existe', async () => {
    mockUserRepo.findByUsername.mockResolvedValue(null)
    await expect(uc.execute({ username: 'nadie', password: 'x' })).rejects.toThrow('Credenciales inválidas')
  })

  test('lanza error si la contraseña es incorrecta', async () => {
    mockUserRepo.findByUsername.mockResolvedValue(makeUserWithHash())
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)
    await expect(uc.execute({ username: 'admin', password: 'mal' })).rejects.toThrow('Credenciales inválidas')
  })

  test('devuelve token y user cuando las credenciales son correctas', async () => {
    const userWithHash = makeUserWithHash()
    mockUserRepo.findByUsername.mockResolvedValue(userWithHash)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

    const result = await uc.execute({ username: 'admin', password: 'correcto' })

    expect(result.token).toBe('test-token')
    expect(result.user).toEqual({ id: 1, username: 'admin', isAdmin: true })
  })

  test('el user devuelto no incluye el hash de la contraseña', async () => {
    mockUserRepo.findByUsername.mockResolvedValue(makeUserWithHash())
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

    const { user } = await uc.execute({ username: 'admin', password: 'correcto' })

    expect(user).not.toHaveProperty('password')
  })

  test('busca el usuario por username en el repositorio', async () => {
    mockUserRepo.findByUsername.mockResolvedValue(null)
    await expect(uc.execute({ username: 'pepe', password: 'x' })).rejects.toThrow()
    expect(mockUserRepo.findByUsername).toHaveBeenCalledWith('pepe')
  })
})
