import Fastify from '@groupclaes/fastify-elastic'
import { FastifyInstance } from 'fastify'
import { env } from 'process'

import baseController from './controllers/base.controller'

const LOGLEVEL = 'debug'

export default async function (config: any): Promise<FastifyInstance | undefined> {
  if (!config || !config.wrapper) return
  if (!config.wrapper.mssql && config.mssql) config.wrapper.mssql = config.mssql

  // add jwt configuration object to config since we want to force JWT
  const fastify = await Fastify({ ...config.wrapper })
  const version_prefix = '/api' + (env.APP_VERSION ? '/' + env.APP_VERSION : '') + '/recipes'
  await fastify.register(baseController, { prefix: `${version_prefix}/${config.wrapper.serviceName}`, logLevel: LOGLEVEL })
  await fastify.listen({ port: +(env['PORT'] ?? 80), host: '::' })

  return fastify
}