import sql from 'mssql'
import { FastifyBaseLogger } from 'fastify'

export default class Analytics {
  schema: string = 'analytics.'
  _logger: FastifyBaseLogger
  _pool: sql.ConnectionPool

  constructor(logger: FastifyBaseLogger, pool: sql.ConnectionPool) {
    this._logger = logger
    this._pool = pool
  }

  async read(id: number, culture: string, user_id?: number, ip?: string, referer?: string, code: number = 2): Promise<any | undefined> {
    const r = new sql.Request(this._pool)
    r.input('id', sql.Int, id)
    r.input('culture', sql.VarChar, culture ?? 'nl')
    r.input('user_id', sql.Int, user_id)
    r.input('referer', sql.VarChar, referer)
    r.input('ip', sql.VarChar, ip)
    r.input('statistics_code', sql.TinyInt, code)
    const result = await r.execute(this.schema + 'p_read')

    if (result.recordset[0])
      return result.recordset[0]
    return undefined
  }
}