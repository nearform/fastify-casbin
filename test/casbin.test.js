'use strict'

const path = require('path')
const tap = require('tap')
const test = tap.test
const Fastify = require('fastify')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const { Model, FileAdapter } = require('casbin')

const plugin = require('../')

const modelPath = path.join(__dirname, 'fixtures', 'basic_model.conf')
const policyPath = path.join(__dirname, 'fixtures', 'basic_policy.csv')

test('casbin should exist', t => {
  t.plan(2)

  const fastify = Fastify()

  fastify.register(plugin, {
    model: modelPath,
    adapter: policyPath
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.casbin)

    fastify.close()
  })
})

test('preloaded model and adapter should be accepted', t => {
  t.plan(2)

  const fastify = Fastify()
  const preloadedModel = new Model()
  preloadedModel.loadModel(modelPath)
  const preloadedAdapter = new FileAdapter(policyPath)

  fastify.register(plugin, {
    model: preloadedModel,
    adapter: preloadedAdapter
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.casbin)

    fastify.close()
  })
})

test('adapter can be omitted for in-memory storage', t => {
  t.plan(2)

  const fastify = Fastify()
  const preloadedModel = new Model()
  preloadedModel.loadModel(modelPath)

  fastify.register(plugin, {
    model: preloadedModel
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.casbin)

    fastify.close()
  })
})

test('casbinJsGetPermissionForUser should exist', t => {
  t.plan(2)

  const fastify = Fastify()

  fastify.register(plugin, {
    model: modelPath,
    adapter: policyPath
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.casbin.casbinJsGetPermissionForUser)

    fastify.close()
  })
})

test('calls loadPolicy on enforcer', t => {
  t.plan(2)

  const fastify = Fastify()

  const enforcer = {
    loadPolicy: sinon.spy()
  }
  const newEnforcer = sinon.stub().resolves(enforcer)

  const plugin = proxyquire('..', {
    casbin: {
      newEnforcer,
      casbinJsGetPermissionForUser: sinon.stub()
    }
  })

  fastify.register(plugin, {
    model: modelPath,
    adapter: policyPath
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(enforcer.loadPolicy.called)

    fastify.close()
  })
})

test('calls casbinJsGetPermissionForUser with enforcer', t => {
  t.plan(2)

  const fastify = Fastify()

  const enforcer = {
    loadPolicy: sinon.spy()
  }

  const newEnforcer = sinon.stub().resolves(enforcer)

  const casbinJsGetPermissionForUser = sinon.spy()

  const plugin = proxyquire('..', {
    casbin: {
      newEnforcer,
      casbinJsGetPermissionForUser
    }
  })

  fastify.register(plugin, {
    model: modelPath,
    adapter: policyPath
  })

  fastify.ready(err => {
    t.error(err)

    fastify.casbin.casbinJsGetPermissionForUser('user')

    t.ok(casbinJsGetPermissionForUser.calledWith(enforcer, 'user'))

    fastify.close()
  })
})

test('sets watcher on enforcer when provided', t => {
  t.plan(2)

  const fastify = Fastify()

  const enforcer = {
    loadPolicy: sinon.spy(),
    setWatcher: sinon.spy()
  }

  const watcher = sinon.stub()

  const newEnforcer = sinon.stub().resolves(enforcer)

  const plugin = proxyquire('..', {
    casbin: {
      newEnforcer,
      casbinJsGetPermissionForUser: sinon.stub()
    }
  })

  fastify.register(plugin, {
    model: modelPath,
    adapter: policyPath,
    watcher
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(enforcer.setWatcher.calledWith(watcher))

    fastify.close()
  })
})

test('closes adapter and watcher', t => {
  t.plan(3)

  const fastify = Fastify()

  const enforcer = {
    loadPolicy: sinon.spy(),
    setWatcher: sinon.spy()
  }

  const adapter = {
    close: sinon.spy()
  }

  const watcher = {
    close: sinon.spy()
  }

  const newEnforcer = sinon.stub().resolves(enforcer)

  const plugin = proxyquire('..', {
    casbin: {
      newEnforcer,
      casbinJsGetPermissionForUser: sinon.stub()
    }
  })

  fastify.register(plugin, {
    model: modelPath,
    adapter,
    watcher
  })

  fastify.ready(err => {
    t.error(err)

    fastify.close(() => {
      t.ok(adapter.close.called)
      t.ok(watcher.close.called)
    })
  })
})
