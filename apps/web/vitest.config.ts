import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        include: [
          'src/lib/httpClient.ts',
          'src/modules/auth/components/LoginForm.tsx',
          'src/modules/catalog/components/ProductList.tsx',
          'src/modules/inventory/components/InventoryTable.tsx',
          'src/modules/sales/components/SaleHistory.tsx',
          'src/modules/purchases/components/PurchaseList.tsx',
          'src/modules/refunds/components/RefundList.tsx',
          'src/modules/notifications/components/NotificationList.tsx',
          'src/modules/reports/components/MonthlyReportTable.tsx',
          'src/modules/reports/components/PivotTable.tsx',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
        reporter: ['text', 'lcov'],
      },
    },
  }),
)
