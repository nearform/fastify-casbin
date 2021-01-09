/// <reference types="node" />

import { FastifyPluginAsync } from 'fastify'
import { Adapter, Enforcer, Watcher, Model } from 'casbin'

declare module 'fastify' {
  interface FastifyInstance {
    casbin: Enforcer & {
      casbinJsGetPermissionForUser(user: string): Promise<string>
    }
  }
}

export interface FastifyCasbinOptions {
  model: string | Model
  adapter?: string | Adapter
  watcher?: Watcher
}

declare const fastifyCasbin: FastifyPluginAsync<FastifyCasbinOptions>

export default fastifyCasbin
