import type { Adapter, Enforcer, Model, Watcher } from 'casbin'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { describe, expect, test } from 'tstyche'
import type { FastifyCasbinOptions } from './index.js'
import fastifyCasbin, { fastifyCasbin as fastifyCasbinPlugin } from './index.js'

describe('fastifyCasbin plugin', () => {
  test('is defined', () => {
    expect(fastifyCasbin).type.not.toBe<undefined>()
  })

  test('is a FastifyPluginAsync with FastifyCasbinOptions', () => {
    expect(fastifyCasbin).type.toBe<FastifyPluginAsync<FastifyCasbinOptions>>()
  })
})

describe('fastifyCasbinPlugin plugin', () => {
  test('is defined', () => {
    expect(fastifyCasbinPlugin).type.not.toBe<undefined>()
  })

  test('is a FastifyPluginAsync with FastifyCasbinOptions', () => {
    expect(fastifyCasbinPlugin).type.toBe<FastifyPluginAsync<FastifyCasbinOptions>>()
  })
})

describe('FastifyCasbinOptions', () => {
  test('model property accepts a string path', () => {
    expect<{ model: string }>().type.toBeAssignableTo<FastifyCasbinOptions>()
  })

  test('model property accepts a Model instance', () => {
    expect<{ model: Model }>().type.toBeAssignableTo<FastifyCasbinOptions>()
  })

  test('adapter property is optional', () => {
    expect<FastifyCasbinOptions>().type.toHaveProperty('adapter')
  })

  test('adapter property accepts a string path', () => {
    expect<{
      model: string
      adapter: string
    }>().type.toBeAssignableTo<FastifyCasbinOptions>()
  })

  test('adapter property accepts an Adapter instance', () => {
    expect<{
      model: string
      adapter: Adapter
    }>().type.toBeAssignableTo<FastifyCasbinOptions>()
  })

  test('watcher property is optional', () => {
    expect<FastifyCasbinOptions>().type.toHaveProperty('watcher')
  })

  test('watcher property accepts a Watcher instance', () => {
    expect<{
      model: string
      watcher: Watcher
    }>().type.toBeAssignableTo<FastifyCasbinOptions>()
  })
})

describe('FastifyInstance.casbin', () => {
  test('extends Enforcer', () => {
    expect<FastifyInstance['casbin']>().type.toBeAssignableTo<Enforcer>()
  })

  test('has casbinJsGetPermissionForUser method', () => {
    expect<FastifyInstance['casbin']>().type.toHaveProperty(
      'casbinJsGetPermissionForUser'
    )
  })

  test('casbinJsGetPermissionForUser is callable with a user string', () => {
    expect<
      FastifyInstance['casbin']['casbinJsGetPermissionForUser']
    >().type.toBeCallableWith('alice')
  })

  test('casbinJsGetPermissionForUser returns Promise<string>', () => {
    expect<
      ReturnType<FastifyInstance['casbin']['casbinJsGetPermissionForUser']>
    >().type.toBe<Promise<string>>()
  })
})
