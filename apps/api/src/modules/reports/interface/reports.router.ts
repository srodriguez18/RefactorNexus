import type { FastifyInstance } from 'fastify'
import { prisma } from '../../../lib/prisma.js'
import { verifyToken, verifyAdmin } from '../../auth/interface/auth.middleware.js'
import { ReportRepositoryPrisma } from '../infrastructure/ReportRepositoryPrisma.js'
import { GetMonthlyReport } from '../application/GetMonthlyReport.js'
import { GetMonthlyTotal } from '../application/GetMonthlyTotal.js'
import { ExportSalesCSV } from '../application/ExportSalesCSV.js'

interface MonthQuery {
  year?: string
  month?: string
}

function parseMonthParams(query: MonthQuery): { year: number; month: number } | null {
  const year = Number(query.year)
  const month = Number(query.month)
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null
  if (!Number.isInteger(month) || month < 1 || month > 12) return null
  return { year, month }
}

export async function reportsRouter(app: FastifyInstance): Promise<void> {
  const reportRepo = new ReportRepositoryPrisma(prisma)
  const getMonthlyReport = new GetMonthlyReport(reportRepo)
  const getMonthlyTotal = new GetMonthlyTotal(reportRepo)
  const exportSalesCSV = new ExportSalesCSV(reportRepo)

  app.get<{ Querystring: MonthQuery }>(
    '/monthly',
    { preHandler: verifyToken },
    async (request, reply) => {
      const params = parseMonthParams(request.query)
      if (!params) return reply.status(400).send({ error: 'year y month son requeridos y deben ser válidos' })
      const rows = await getMonthlyReport.execute(params)
      return reply.send(rows)
    },
  )

  app.get<{ Querystring: MonthQuery }>(
    '/total',
    { preHandler: verifyToken },
    async (request, reply) => {
      const params = parseMonthParams(request.query)
      if (!params) return reply.status(400).send({ error: 'year y month son requeridos y deben ser válidos' })
      const result = await getMonthlyTotal.execute(params)
      return reply.send(result)
    },
  )

  app.get<{ Querystring: MonthQuery }>(
    '/export',
    { preHandler: verifyAdmin },
    async (request, reply) => {
      const params = parseMonthParams(request.query)
      if (!params) return reply.status(400).send({ error: 'year y month son requeridos y deben ser válidos' })
      const csv = await exportSalesCSV.execute(params)
      const filename = `ventas-${String(params.year)}-${String(params.month).padStart(2, '0')}.csv`
      return reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', `attachment; filename=${filename}`)
        .send(csv)
    },
  )
}
