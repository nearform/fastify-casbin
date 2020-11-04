'use strict'

const fp = require('fastify-plugin')
const { newEnforcer, casbinJsGetPermissionForUser } = require('casbin')

async function fastifyCasbin (fastify, { modelPath, adapter, watcher }) {
  const enforcer = await newEnforcer(modelPath, adapter)

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
