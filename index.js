import fp from 'fastify-plugin'
import { newEnforcer, casbinJsGetPermissionForUser } from 'casbin'

export async function fastifyCasbin (fastify, { model, adapter, watcher }) {
  const enforcerParams = adapter ? [model, adapter] : [model]
  const enforcer = await newEnforcer(...enforcerParams)

  if (watcher) {
    enforcer.setWatcher(watcher)
  }

  if (adapter) {
    await enforcer.loadPolicy()
  }

  fastify.onClose(async () => {
    await Promise.all(
      [adapter, watcher]
        .filter(o => o && typeof o.close === 'function')
        .map(o => o.close())
    )
  })

  enforcer.casbinJsGetPermissionForUser = user =>
    casbinJsGetPermissionForUser(enforcer, user)

  fastify.decorate('casbin', enforcer)
}

export default fp(fastifyCasbin, {
  name: 'fastify-casbin',
  fastify: '5.x'
})
