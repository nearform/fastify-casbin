/// <reference types="node" />

import { FastifyPluginAsync } from 'fastify'
import { Adapter, Enforcer, Watcher } from 'casbin'

declare module 'fastify' {
  interface FastifyInstance {
    casbin: Enforcer & {
      casbinJsGetPermissionForUser(user: string): Promise<string>
    }
  }
}

export interface FastifyCasbinOptions {
  modelPath: string
  adapter: string | Adapter
  watcher?: Watcher
}

declare const fastifyCasbin: FastifyPluginAsync<FastifyCasbinOptions>

export default fastifyCasbin
