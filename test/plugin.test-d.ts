import { Enforcer, FileAdapter, Watcher } from 'casbin'
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

// no options
server.register(fastifyCasbin)

// string adapter
server.register(fastifyCasbin, {
  modelPath: 'some file',
  adapter: 'some adapter',
})

// typed adapter
server.register(fastifyCasbin, {
  modelPath: 'some file',
  adapter: new FileAdapter('some file'),
})

// watcher
server.register(fastifyCasbin, {
  modelPath: 'some file',
  adapter: 'some adapter',
  watcher: new TestWatcher(),
})

expectAssignable<Enforcer>(server.casbin)
expectType<CasbinJsGetPermissionsForUser>(
  server.casbin.casbinJsGetPermissionForUser
)
