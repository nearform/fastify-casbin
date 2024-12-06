import { Enforcer, FileAdapter, Model, Watcher } from 'casbin'
import fastify from 'fastify'
import { expectAssignable, expectType } from 'tsd'

import fastifyCasbin from '../plugin'

class TestWatcher implements Watcher {
  setUpdateCallback(cb: () => void): void {}
  async update(): Promise<boolean> {
    return true
  }
}

interface CasbinJsGetPermissionsForUser {
  (user: string): Promise<string>
}

const server = fastify()

// string adapter
server.register(fastifyCasbin, {
  model: 'some file',
  adapter: 'some adapter',
})

// in-memory adapter
server.register(fastifyCasbin, {
  model: 'some file'
})

const model: Model = {} as Model
server.register(fastifyCasbin, {
  model: model,
  adapter: new FileAdapter('some file'),
})

// typed adapter
server.register(fastifyCasbin, {
  model: 'some file',
  adapter: new FileAdapter('some file'),
})

// watcher
server.register(fastifyCasbin, {
  model: 'some file',
  adapter: 'some adapter',
  watcher: new TestWatcher(),
})

expectAssignable<Enforcer>(server.casbin)
expectType<CasbinJsGetPermissionsForUser>(
  server.casbin.casbinJsGetPermissionForUser
)
