const VAT_RATE = 1.16
const USD_MXN_RATE = 17.5

export function applyVAT(amount: number): number {
  return parseFloat((amount * VAT_RATE).toFixed(2))
}

export function calculateVolumeDiscount(quantity: number, subtotal: number): number {
  if (quantity > 50) return subtotal * 0.10
  if (quantity > 10) return subtotal * 0.05
  return 0
}

export function calculateLegacyADiscount(subtotal: number): number {
  return parseFloat((subtotal * 0.15).toFixed(2))
}

export function convertCurrency(
  amount: number,
  from: 'MXN' | 'USD',
  to: 'MXN' | 'USD',
): number {
  if (from === to) return amount
  if (from === 'USD') return parseFloat((amount * USD_MXN_RATE).toFixed(2))
  return parseFloat((amount / USD_MXN_RATE).toFixed(2))
}

export function calculateSaleTotal(params: {
  items: Array<{ quantity: number; unitPrice: number }>
  customerType: 'NORMAL' | 'LEGACY_A'
}): { subtotal: number; discount: number; total: number } {
  const { items, customerType } = params

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  const volumeDiscount = calculateVolumeDiscount(totalQuantity, subtotal)
  const baseAfterVolume = subtotal - volumeDiscount

  const customerDiscount =
    customerType === 'LEGACY_A' ? calculateLegacyADiscount(baseAfterVolume) : 0

  const base = baseAfterVolume - customerDiscount
  const discount = volumeDiscount + customerDiscount
  const total = applyVAT(base)

  return { subtotal, discount, total }
}
