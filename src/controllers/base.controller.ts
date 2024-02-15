import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import Recipe from '../repositories/recipe.repository'
import sql from 'mssql'
import QRCode from 'qrcode'

declare module 'fastify' {
  export interface FastifyInstance {
    getSqlPool: (name?: string) => Promise<sql.ConnectionPool>
  }

  export interface FastifyReply {
    success: (data?: any, code?: number, executionTime?: number) => FastifyReply
    fail: (data?: any, code?: number, executionTime?: number) => FastifyReply
    error: (message?: string, code?: number, executionTime?: number) => FastifyReply
  }
}

export default async function (fastify: FastifyInstance) {
  /**
   * Get analytics dashboard from DB
   * @route GET /api/{APP_VERSION}/recipes/detail/:id
   */
  fastify.get('/:id', async function (request: FastifyRequest<{
    Params: {
      id: number
    },
    Querystring: {
      culture: string,
      user_id?: number
    }
  }>, reply: FastifyReply) {
    const start = performance.now()

    try {
      const id = +request.params.id
      const culture = request.query.culture ?? 'nl'
      const user_id = request.query.user_id
      const ip = request.raw.headers['x-forwarded-for']?.toString()
      const referer = request.raw.headers['referer']


      const pool = await fastify.getSqlPool()
      const repo = new Recipe(request.log, pool)
      const recipe = await repo.read(id, culture, user_id, ip, referer, 2)

      if (recipe) return reply.success({ recipe }, 200, performance.now() - start)
      return reply.fail({ id: 'recipe not found!' }, 404, performance.now() - start)
    } catch (err) {
      request.log.error({ err }, 'failed to get analytics dashboard!')
      return reply.error('failed to get analytics dashboard!', 500, performance.now() - start)
    }
  })

  /**
   * Get analytics dashboard from DB
   * @route GET /api/{APP_VERSION}/recipes/detail/:id/qr-code.png
   */
  fastify.get('/:id/qr-code.png', async function (request: FastifyRequest<{
    Params: {
      id: number
    },
    Querystring: {
      culture: string
    }
  }>, reply: FastifyReply) {
    const start = performance.now()

    try {
      const id = +request.params.id
      const culture = request.query.culture ?? 'nl'

      const pool = await fastify.getSqlPool()
      const repo = new Recipe(request.log, pool)
      const recipe = await repo.read(id, culture)

      if (recipe) {
        const url = `https://www.claes-distribution.be/recepten/${id}/${recipe.title.split(' ').join('-').toLowerCase()}`
        const qrImage = await QRCode.toDataURL(url)

        const lastMod = new Date()
        return reply
          .header('Cache-Control', 'must-revalidate, max-age=172800, private')
          .header('Expires', new Date(lastMod.getTime() + 172800000).toUTCString())
          .header('Last-Modified', lastMod.toUTCString())
          .type('image/png')
          .send(Buffer.from(qrImage.replace('data:image/png;base64,', ''), 'base64'))
      }
      return reply.fail({ id: 'recipe not found!' }, 404, performance.now() - start)
    } catch (err) {
      request.log.error({ err }, 'failed to get analytics dashboard!')
      return reply.error('failed to get analytics dashboard!', 500, performance.now() - start)
    }
  })
}