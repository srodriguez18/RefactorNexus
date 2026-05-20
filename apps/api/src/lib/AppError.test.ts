import { describe, test, expect } from 'vitest'
import { AppError } from './AppError.js'

describe('AppError', () => {
  test('sets message and statusCode', () => {
    const err = new AppError('No encontrado', 404)
    expect(err.message).toBe('No encontrado')
    expect(err.statusCode).toBe(404)
  })

  test('name es AppError', () => {
    const err = new AppError('Error', 400)
    expect(err.name).toBe('AppError')
  })

  test('es instancia de Error', () => {
    expect(new AppError('x', 500)).toBeInstanceOf(Error)
  })
})
