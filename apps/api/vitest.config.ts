import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/AppError.ts',
        'src/modules/auth/application/Login.ts',
        'src/modules/inventory/domain/InventoryStock.ts',
        'src/modules/inventory/application/AdjustStock.ts',
        'src/modules/sales/domain/Sale.ts',
        'src/modules/sales/domain/SaleItem.ts',
        'src/modules/sales/application/ReturnSale.ts',
        'src/modules/refunds/domain/Refund.ts',
        'src/modules/refunds/application/CreateRefund.ts',
        'src/modules/refunds/application/ApproveRefund.ts',
        'src/modules/refunds/application/RejectRefund.ts',
        'src/modules/purchases/application/ReconcilePurchase.ts',
        'src/modules/notifications/application/BroadcastNotification.ts',
        'src/modules/notifications/application/MarkAsRead.ts',
        'src/modules/notifications/application/DeleteNotification.ts',
        'src/modules/exports/domain/PivotDimension.ts',
        'src/modules/exports/application/GetPivotReport.ts',
        'src/modules/exports/application/GetAggregateTotals.ts',
        'src/modules/exports/application/DownloadCSV.ts',
      ],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
      reporter: ['text', 'lcov'],
    },
  },
})
