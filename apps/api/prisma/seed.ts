import { readFileSync } from 'fs'
import { resolve } from 'path'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Normaliza los 4 formatos de fecha que tiene el legacy
function parseDate(value: string | null): Date | null {
  if (!value) return null
  if (/^\d{9,}$/.test(value)) return new Date(parseInt(value) * 1000)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [d, m, y] = value.split('/')
    return new Date(`${y}-${m}-${d}`)
  }
  return new Date(value.replace(' ', 'T'))
}

function parseRefundStatus(value: string): string {
  const map: Record<string, string> = {
    pending: 'pending',
    Approved: 'approved',
    aprobada: 'approved',
    done: 'approved',
    rejected: 'rejected',
  }
  return map[value] ?? 'pending'
}

function parseNotificationStatus(value: string): string {
  const map: Record<string, string> = {
    unread: 'unread',
    read: 'read',
    READ: 'read',
    leido: 'read',
  }
  return map[value] ?? 'unread'
}

function parseSaleStatus(value: string): string {
  const lower = value.toLowerCase()
  if (['completed', 'done', 'finalizada'].includes(lower)) return 'completed'
  return lower
}

type SqlValue = string | number | null

function parseValues(valuesStr: string): SqlValue[] {
  const result: SqlValue[] = []
  let i = 0

  while (i < valuesStr.length) {
    while (i < valuesStr.length && (valuesStr[i] === ' ' || valuesStr[i] === ',')) i++
    if (i >= valuesStr.length) break

    if (valuesStr[i] === "'") {
      i++
      let s = ''
      while (i < valuesStr.length) {
        if (valuesStr[i] === "'" && valuesStr[i + 1] === "'") {
          s += "'"
          i += 2
        } else if (valuesStr[i] === "'") {
          i++
          break
        } else {
          s += valuesStr[i++]
        }
      }
      result.push(s)
    } else if (valuesStr.startsWith('NULL', i)) {
      result.push(null)
      i += 4
    } else {
      let numStr = ''
      while (i < valuesStr.length && valuesStr[i] !== ',') {
        numStr += valuesStr[i++]
      }
      result.push(parseFloat(numStr.trim()))
    }
  }

  return result
}

function extractInserts(sql: string, tableName: string): Record<string, SqlValue>[] {
  const results: Record<string, SqlValue>[] = []
  const lines = sql.split('\n').map((l) => l.trim())
  const prefix = `INSERT INTO ${tableName} (`

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith(prefix)) continue

    const colsEnd = line.indexOf(') VALUES')
    if (colsEnd === -1) continue

    const columns = line
      .slice(prefix.length, colsEnd)
      .split(',')
      .map((c) => c.trim())

    const afterValues = line.slice(colsEnd + ') VALUES'.length).trim()

    const parseRow = (valuesStr: string): void => {
      const values = parseValues(valuesStr)
      const row: Record<string, SqlValue> = {}
      columns.forEach((col, idx) => {
        row[col] = values[idx] ?? null
      })
      results.push(row)
    }

    if (afterValues.startsWith('(')) {
      // Single-row: INSERT INTO t (cols) VALUES (vals);
      const inner = afterValues.slice(1, afterValues.lastIndexOf(')'))
      parseRow(inner)
    } else {
      // Multi-row: value tuples on following lines
      i++
      while (i < lines.length) {
        const valLine = lines[i]
        if (!valLine.startsWith('(')) break
        const isLast = valLine.endsWith(';')
        const cleaned = valLine.replace(/[,;]$/, '')
        const inner = cleaned.slice(1, cleaned.lastIndexOf(')'))
        parseRow(inner)
        if (isLast) break
        i++
      }
    }
  }

  return results
}

async function main() {
  const sqlPath = process.argv[2] ?? resolve(process.cwd(), '../../seed_data.sql')
  const sql = readFileSync(sqlPath, 'utf-8')

  const existing = await prisma.user.count()
  if (existing > 0) {
    console.log(`DB already seeded (${existing} users found) — skipping.`)
    return
  }

  // 1. Users — hash legacy plaintext passwords
  const userRows = extractInserts(sql, 'users')
  for (const row of userRows) {
    const hash = await bcrypt.hash(String(row['password']), 10)
    await prisma.user.create({
      data: {
        username: String(row['username']),
        password: hash,
        isAdmin: row['is_admin'] === 1,
      },
    })
  }
  console.log(`✓ ${userRows.length} users`)

  // 2. Warehouses
  const warehouseRows = extractInserts(sql, 'warehouses')
  await prisma.warehouse.createMany({
    data: warehouseRows.map((r) => ({
      name: String(r['name']),
      region: r['region'] != null ? String(r['region']) : null,
    })),
  })
  console.log(`✓ ${warehouseRows.length} warehouses`)

  // 3. Suppliers
  const supplierRows = extractInserts(sql, 'suppliers')
  await prisma.supplier.createMany({
    data: supplierRows.map((r) => ({
      name: String(r['name']),
      contact: r['contact'] != null ? String(r['contact']) : null,
      country: r['country'] != null ? String(r['country']) : null,
    })),
  })
  console.log(`✓ ${supplierRows.length} suppliers`)

  // 4. Products (500 rows — chunked to avoid SQLite limits)
  const productRows = extractInserts(sql, 'products')
  const CHUNK = 100
  for (let i = 0; i < productRows.length; i += CHUNK) {
    await prisma.product.createMany({
      data: productRows.slice(i, i + CHUNK).map((r) => ({
        id: Number(r['id']),
        sku: String(r['sku']),
        name: String(r['name']),
        description: r['description'] != null ? String(r['description']) : null,
        price: Number(r['price']),
        category: r['category'] != null ? String(r['category']) : null,
        supplierId: r['supplier_id'] != null ? Number(r['supplier_id']) : null,
        createdAt: parseDate(r['created_at'] != null ? String(r['created_at']) : null) ?? new Date(),
        updatedAt: parseDate(r['updated_at'] != null ? String(r['updated_at']) : null) ?? new Date(),
        deletedAt: parseDate(r['deleted_at'] != null ? String(r['deleted_at']) : null),
      })),
    })
  }
  console.log(`✓ ${productRows.length} products`)

  // 5. Inventory stock (~1500 rows — chunked)
  const stockRows = extractInserts(sql, 'inventory_stock')
  for (let i = 0; i < stockRows.length; i += CHUNK) {
    await prisma.inventoryStock.createMany({
      data: stockRows.slice(i, i + CHUNK).map((r) => ({
        productId: Number(r['product_id']),
        warehouseId: Number(r['warehouse_id']),
        quantity: Number(r['quantity']),
      })),
    })
  }
  console.log(`✓ ${stockRows.length} inventory stock rows`)

  // 6. Sales — legacy has product_id on sale row (denormalized), ignored here;
  //    sale_items carries the actual product + qty + unit_price
  const saleRows = extractInserts(sql, 'sales')
  for (const s of saleRows) {
    await prisma.sale.create({
      data: {
        id: Number(s['id']),
        userId: Number(s['user_id']),
        customerType: String(s['customer_type']),
        subtotal: Number(s['subtotal']),
        discount: 0,
        total: parseFloat(String(s['total'])),
        status: parseSaleStatus(String(s['status'])),
        createdAt: parseDate(s['created_at'] != null ? String(s['created_at']) : null) ?? new Date(),
        lastTouchAt: parseDate(s['last_touch_at'] != null ? String(s['last_touch_at']) : null),
      },
    })
  }
  console.log(`✓ ${saleRows.length} sales`)

  // 7. Sale items
  const saleItemRows = extractInserts(sql, 'sale_items')
  for (let i = 0; i < saleItemRows.length; i += CHUNK) {
    await prisma.saleItem.createMany({
      data: saleItemRows.slice(i, i + CHUNK).map((r) => ({
        saleId: Number(r['sale_id']),
        productId: Number(r['product_id']),
        quantity: Number(r['qty']),
        unitPrice: Number(r['unit_price']),
      })),
    })
  }
  console.log(`✓ ${saleItemRows.length} sale items`)

  // 8. Purchases
  const purchaseRows = extractInserts(sql, 'purchases')
  for (const p of purchaseRows) {
    await prisma.purchase.create({
      data: {
        id: Number(p['id']),
        supplierId: Number(p['supplier_id']),
        total: Number(p['total']),
        receivedDate: parseDate(p['received_date'] != null ? String(p['received_date']) : null),
        bankRef: p['bank_ref'] != null ? String(p['bank_ref']) : null,
        status: String(p['status']),
      },
    })
  }
  console.log(`✓ ${purchaseRows.length} purchases`)

  // 9. Purchase items
  const purchaseItemRows = extractInserts(sql, 'purchase_items')
  await prisma.purchaseItem.createMany({
    data: purchaseItemRows.map((r) => ({
      purchaseId: Number(r['purchase_id']),
      productId: Number(r['product_id']),
      quantity: Number(r['qty']),
      unitCost: Number(r['unit_cost']),
    })),
  })
  console.log(`✓ ${purchaseItemRows.length} purchase items`)

  // 10. Notifications
  const notifRows = extractInserts(sql, 'notifications')
  await prisma.notification.createMany({
    data: notifRows.map((r) => ({
      id: Number(r['id']),
      userId: Number(r['user_id']),
      message: String(r['message']),
      kind: String(r['kind']),
      status: parseNotificationStatus(String(r['status'])),
      createdAt: parseDate(r['created_at'] != null ? String(r['created_at']) : null) ?? new Date(),
    })),
  })
  console.log(`✓ ${notifRows.length} notifications`)

  // 11. Refunds — legacy amount is TEXT; status has inconsistent casing/language
  const refundRows = extractInserts(sql, 'refunds')
  await prisma.refund.createMany({
    data: refundRows.map((r) => ({
      id: Number(r['id']),
      saleId: Number(r['sale_id']),
      userId: Number(r['user_id']),
      reason: String(r['reason']),
      amount: parseFloat(String(r['amount'])),
      status: parseRefundStatus(String(r['status'])),
      approvedBy: r['approved_by'] != null ? Number(r['approved_by']) : null,
      createdAt: parseDate(r['created_at'] != null ? String(r['created_at']) : null) ?? new Date(),
    })),
  })
  console.log(`✓ ${refundRows.length} refunds`)

  console.log('\nSeed completed.')
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
