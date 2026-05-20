import { describe, expect, it } from 'vitest'
import {
  applyVAT,
  calculateSaleTotal,
  calculateVolumeDiscount,
} from './index.js'

describe('applyVAT', () => {
  it('applies 16% VAT', () => {
    expect(applyVAT(100)).toBe(116)
  })
})

describe('calculateVolumeDiscount', () => {
  it('returns 0 when quantity <= 10', () => {
    expect(calculateVolumeDiscount(5, 100)).toBe(0)
  })

  it('returns 5% when quantity > 10', () => {
    expect(calculateVolumeDiscount(15, 100)).toBe(5)
  })

  it('returns 10% when quantity > 50', () => {
    expect(calculateVolumeDiscount(60, 100)).toBe(10)
  })
})

describe('calculateSaleTotal', () => {
  it('NORMAL customer, qty=5 — no discount', () => {
    const result = calculateSaleTotal({
      items: [{ quantity: 5, unitPrice: 10 }],
      customerType: 'NORMAL',
    })
    expect(result.subtotal).toBe(50)
    expect(result.discount).toBe(0)
    expect(result.total).toBe(58)
  })

  it('NORMAL customer, qty=15 — 5% volume discount', () => {
    const result = calculateSaleTotal({
      items: [{ quantity: 15, unitPrice: 10 }],
      customerType: 'NORMAL',
    })
    // subtotal=150, volumeDiscount=7.5, base=142.5, total=142.5*1.16
    expect(result.subtotal).toBe(150)
    expect(result.discount).toBe(7.5)
    expect(result.total).toBe(165.3)
  })

  it('NORMAL customer, qty=60 — 10% volume discount', () => {
    const result = calculateSaleTotal({
      items: [{ quantity: 60, unitPrice: 10 }],
      customerType: 'NORMAL',
    })
    // subtotal=600, volumeDiscount=60, base=540, total=540*1.16
    expect(result.subtotal).toBe(600)
    expect(result.discount).toBe(60)
    expect(result.total).toBe(626.4)
  })

  it('LEGACY_A customer — 15% customer discount + VAT', () => {
    const result = calculateSaleTotal({
      items: [{ quantity: 5, unitPrice: 100 }],
      customerType: 'LEGACY_A',
    })
    // subtotal=500, volumeDiscount=0, baseAfterVolume=500
    // customerDiscount=75, base=425, total=425*1.16=493
    expect(result.subtotal).toBe(500)
    expect(result.discount).toBe(75)
    expect(result.total).toBe(493)
  })
})
