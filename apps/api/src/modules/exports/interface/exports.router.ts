import type { FastifyInstance } from 'fastify'
import { prisma } from '../../../lib/prisma.js'
import { verifyToken, verifyAdmin } from '../../auth/interface/auth.middleware.js'
import { ExportRepositoryPrisma } from '../infrastructure/ExportRepositoryPrisma.js'
import { GetPivotReport } from '../application/GetPivotReport.js'
import { GetAggregateTotals } from '../application/GetAggregateTotals.js'
import { DownloadCSV } from '../application/DownloadCSV.js'

interface PivotQuery  { year?: string; rowDim?: string; colDim?: string }
interface TotalsQuery { year?: string; customerType?: string }
interface CSVQuery    { year?: string; month?: string; customerType?: string }

export async function exportsRouter(app: FastifyInstance): Promise<void> {
  const exportRepo       = new ExportRepositoryPrisma(prisma)
  const getPivotReport   = new GetPivotReport(exportRepo)
  const getAggregateTotals = new GetAggregateTotals(exportRepo)
  const downloadCSV      = new DownloadCSV(exportRepo)

  app.get<{ Querystring: PivotQuery }>(
    '/pivot',
    { preHandler: verifyToken },
    async (request, reply) => {
      const year = Number(request.query.year)
      if (!Number.isInteger(year) || year < 2000) {
        return reply.status(400).send({ error: 'year inválido' })
      }
      try {
        const rows = await getPivotReport.execute({
          year,
          rowDim: request.query.rowDim ?? '',
          colDim: request.query.colDim ?? '',
        })
        return reply.send(rows)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error en reporte pivot'
        return reply.status(400).send({ error: message })
      }
    },
  )

  app.get<{ Querystring: TotalsQuery }>(
    '/aggregate',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const result = await getAggregateTotals.execute({
          year: request.query.year !== undefined ? Number(request.query.year) : undefined,
          customerType: request.query.customerType,
        })
        return reply.send(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al obtener totales'
        return reply.status(400).send({ error: message })
      }
    },
  )

  app.get<{ Querystring: CSVQuery }>(
    '/export-csv',
    { preHandler: verifyAdmin },
    async (request, reply) => {
      try {
        const csv = await downloadCSV.execute({
          year:         request.query.year  !== undefined ? Number(request.query.year)  : undefined,
          month:        request.query.month !== undefined ? Number(request.query.month) : undefined,
          customerType: request.query.customerType,
        })
        return reply
          .header('Content-Type', 'text/csv; charset=utf-8')
          .header('Content-Disposition', 'attachment; filename=export.csv')
          .send(csv)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al exportar CSV'
        return reply.status(400).send({ error: message })
      }
    },
  )
}
