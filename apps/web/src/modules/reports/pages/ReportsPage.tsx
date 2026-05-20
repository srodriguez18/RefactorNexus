import { useState } from 'react'
import type { RowDimension, ColDimension } from '@legacy-nexus/shared'
import { useAuthContext } from '../../../context/AuthContext'
import {
  useMonthlyReport,
  useMonthlyTotal,
  usePivotReport,
  useExportCSV,
  useDownloadCSV,
} from '../hooks/useReports'
import { MonthPicker } from '../components/MonthPicker'
import { MonthlyReportTable } from '../components/MonthlyReportTable'
import { ExportButton } from '../components/ExportButton'
import { AggregateTotalsCard } from '../components/AggregateTotalsCard'
import { PivotControls } from '../components/PivotControls'
import { PivotTable } from '../components/PivotTable'

type Tab = 'monthly' | 'aggregate' | 'pivot'

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.5rem 1.25rem',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  borderBottom: active ? '2px solid #1a1a2e' : '2px solid transparent',
  fontWeight: active ? 600 : 400,
  color: active ? '#1a1a2e' : '#666',
  fontSize: '0.95rem',
})

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

function defaultPeriod() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function ReportsPage() {
  const { currentUser } = useAuthContext()
  const isAdmin = currentUser?.isAdmin ?? false

  const [tab, setTab] = useState<Tab>('monthly')

  // ── Tab 1: Reporte mensual ────────────────────────────────────────
  const [{ year, month }, setPeriod] = useState(defaultPeriod)
  const reportQuery = useMonthlyReport(year, month)
  const totalQuery  = useMonthlyTotal(year, month)
  const exportCSV   = useExportCSV()
  const downloadCSV = useDownloadCSV()

  const [csvLoading, setCsvLoading] = useState(false)
  const [csvError,   setCsvError]   = useState<string | null>(null)

  const handleDownloadFull = async () => {
    setCsvError(null)
    setCsvLoading(true)
    try {
      await downloadCSV({ year, month })
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : 'Error al exportar')
    } finally {
      setCsvLoading(false)
    }
  }

  // ── Tab 3: Análisis dimensional ───────────────────────────────────
  const currentYear = new Date().getFullYear()
  const [pivotYear,   setPivotYear]   = useState(currentYear)
  const [pivotRowDim, setPivotRowDim] = useState<RowDimension>('customerType')
  const [pivotColDim, setPivotColDim] = useState<ColDimension>('category')
  const [pivotReady,  setPivotReady]  = useState(false)

  const pivotQuery = usePivotReport({
    year: pivotYear,
    rowDim: pivotRowDim,
    colDim: pivotColDim,
    enabled: pivotReady,
  })

  const handleGenerate = () => {
    setPivotReady(true)
    if (pivotReady) pivotQuery.refetch()
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 1.25rem', fontSize: '1.4rem' }}>Reportes</h1>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '1.5rem' }}>
        <button style={tabStyle(tab === 'monthly')}   onClick={() => setTab('monthly')}>Reporte Mensual</button>
        <button style={tabStyle(tab === 'aggregate')} onClick={() => setTab('aggregate')}>Totales Agregados</button>
        <button style={tabStyle(tab === 'pivot')}     onClick={() => setTab('pivot')}>Análisis Dimensional</button>
      </div>

      {/* ── Tab 1 ── */}
      {tab === 'monthly' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <MonthPicker year={year} month={month} onChange={(y, m) => setPeriod({ year: y, month: m })} />
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                  <button
                    onClick={handleDownloadFull}
                    disabled={csvLoading}
                    style={{
                      padding: '0.45rem 0.9rem',
                      background: csvLoading ? '#999' : '#455a64',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: csvLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    {csvLoading ? 'Exportando…' : 'Descargar CSV completo'}
                  </button>
                  {csvError && (
                    <span role="alert" style={{ fontSize: '0.78rem', color: '#c00' }}>{csvError}</span>
                  )}
                </div>
                <ExportButton year={year} month={month} />
              </div>
            )}
          </div>

          {totalQuery.data && (
            <div style={{
              display: 'inline-flex', gap: '2rem', background: '#f5f5ff',
              border: '1px solid #d0d0f0', borderRadius: '8px',
              padding: '0.75rem 1.5rem', marginBottom: '1.5rem', fontSize: '0.9rem',
            }}>
              <div>
                <span style={{ color: '#666' }}>Ventas del mes </span>
                <strong>{totalQuery.data.count}</strong>
              </div>
              <div>
                <span style={{ color: '#666' }}>Total facturado </span>
                <strong>{fmt.format(totalQuery.data.total)}</strong>
              </div>
            </div>
          )}
          {totalQuery.isLoading && (
            <p aria-busy="true" style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem' }}>
              Cargando resumen…
            </p>
          )}

          <MonthlyReportTable
            rows={reportQuery.data ?? []}
            isLoading={reportQuery.isLoading}
            isError={reportQuery.isError}
            onRetry={() => reportQuery.refetch()}
          />
        </div>
      )}

      {/* ── Tab 2 ── */}
      {tab === 'aggregate' && <AggregateTotalsCard />}

      {/* ── Tab 3 ── */}
      {tab === 'pivot' && (
        <div>
          <PivotControls
            year={pivotYear}
            rowDim={pivotRowDim}
            colDim={pivotColDim}
            onYear={setPivotYear}
            onRowDim={setPivotRowDim}
            onColDim={setPivotColDim}
            onGenerate={handleGenerate}
            isLoading={pivotQuery.isFetching}
          />
          <PivotTable
            rows={pivotQuery.data ?? []}
            isLoading={pivotQuery.isFetching}
            isError={pivotQuery.isError}
            onRetry={() => pivotQuery.refetch()}
            empty={!pivotReady}
          />
        </div>
      )}
    </div>
  )
}
