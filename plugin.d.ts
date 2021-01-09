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
  modelPath?: string
  enforcerParam?: any // could be anything that newEnforcer() supports as the first argument. Common cases include `string` for modelPath and `Model` for programmatically instantiated model.
  adapter: string | Adapter
  watcher?: Watcher
}

declare const fastifyCasbin: FastifyPluginAsync<FastifyCasbinOptions>

export default fastifyCasbin
