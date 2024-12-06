'use strict'

const path = require('path')
const { test } = require('node:test')
const Fastify = require('fastify')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const fs = require('fs')
const { Model, FileAdapter, setDefaultFileSystem } = require('casbin')

const plugin = require('../')

const modelPath = path.join(__dirname, 'fixtures', 'basic_model.conf')
const policyPath = path.join(__dirname, 'fixtures', 'basic_policy.csv')

setDefaultFileSystem(fs)

test('casbin should exist', (t, done) => {
  t.plan(2)

  const fastify = Fastify()

  fastify.register(plugin, {
    model: modelPath,
    adapter: policyPath
  })

  fastify.ready(err => {
    t.assert.ok(!err)
    t.assert.ok(fastify.casbin)

    fastify.close()
    done()
  })
})

test('preloaded model and adapter should be accepted', (t, done) => {
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
    t.assert.ok(!err)
    t.assert.ok(fastify.casbin)

    fastify.close()
    done()
  })
})

test('adapter can be omitted for in-memory storage', (t, done) => {
  t.plan(2)

  const fastify = Fastify()
  const preloadedModel = new Model()
  preloadedModel.loadModel(modelPath)

  fastify.register(plugin, {
    model: preloadedModel
  })

  fastify.ready(err => {
    t.assert.ok(!err)
    t.assert.ok(fastify.casbin)

    fastify.close()
    done()
  })
})

test('casbinJsGetPermissionForUser should exist', (t, done) => {
  t.plan(2)

  const fastify = Fastify()

  fastify.register(plugin, {
    model: modelPath,
    adapter: policyPath
  })

  fastify.ready(err => {
    t.assert.ok(!err)
    t.assert.ok(fastify.casbin.casbinJsGetPermissionForUser)

    fastify.close()
    done()
  })
})

test('calls loadPolicy on enforcer', (t, done) => {
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
    t.assert.ok(!err)
    t.assert.ok(enforcer.loadPolicy.called)

    fastify.close()
    done()
  })
})

test('calls casbinJsGetPermissionForUser with enforcer', (t, done) => {
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
    t.assert.ok(!err)

    fastify.casbin.casbinJsGetPermissionForUser('user')

    t.assert.ok(casbinJsGetPermissionForUser.calledWith(enforcer, 'user'))

    fastify.close()
    done()
  })
})

test('sets watcher on enforcer when provided', (t, done) => {
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
    t.assert.ok(!err)
    t.assert.ok(enforcer.setWatcher.calledWith(watcher))

    fastify.close()
    done()
  })
})

test('closes adapter and watcher', (t, done) => {
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
    t.assert.ok(!err)

    fastify.close(() => {
      t.assert.ok(adapter.close.called)
      t.assert.ok(watcher.close.called)

      done()
    })
  })
})
