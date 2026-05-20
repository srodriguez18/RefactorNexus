import { describe, test, expect } from 'vitest'
import { InventoryStock } from './InventoryStock.js'

describe('InventoryStock', () => {
  test('canDecrement devuelve true cuando hay stock suficiente', () => {
    expect(new InventoryStock(1, 1, 10).canDecrement(10)).toBe(true)
  })

  test('canDecrement devuelve false cuando el stock es insuficiente', () => {
    expect(new InventoryStock(1, 1, 5).canDecrement(6)).toBe(false)
  })

  test('canDecrement devuelve true para cantidad 0', () => {
    expect(new InventoryStock(1, 1, 0).canDecrement(0)).toBe(true)
  })

  test('canDecrement devuelve false cuando stock es 0 y se pide 1', () => {
    expect(new InventoryStock(1, 1, 0).canDecrement(1)).toBe(false)
  })
})
