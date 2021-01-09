'use strict'

const fp = require('fastify-plugin')
const { newEnforcer, casbinJsGetPermissionForUser } = require('casbin')

async function fastifyCasbin (fastify, { modelPath, enforcerParam, adapter, watcher }) {
  if (enforcerParam && modelPath) {
    throw new Error("Can't specify both 'modelPath' and 'enforcerParam'")
  }
  if (!enforcerParam && !modelPath) {
    throw new Error("Have to specify either 'modelPath' or 'enforcerParam'")
  }

  const enforcerParams = enforcerParam ? [enforcerParam] : [modelPath]
  enforcerParams.push(adapter)
  const enforcer = await newEnforcer(...enforcerParams)

  if (watcher) {
    enforcer.setWatcher(watcher)
  }

  await enforcer.loadPolicy()

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

module.exports = fp(fastifyCasbin, {
  name: 'fastify-casbin'
})
