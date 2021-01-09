# fastify-casbin

![Continuous Integration](https://github.com/nearform/fastify-casbin/workflows/ci/badge.svg)
[![codecov](https://codecov.io/gh/nearform/fastify-casbin/branch/master/graph/badge.svg?token=gfJ55XYZAV)](https://codecov.io/gh/nearform/fastify-casbin)
[![npm version](https://badge.fury.io/js/fastify-casbin.svg)](https://badge.fury.io/js/fastify-casbin)

A plugin for [Fastify](http://fastify.io/) that adds support for [Casbin](https://casbin.org/).

It provides an unopinionated approach to use [Casbin's Node.js APIs](https://github.com/casbin/node-casbin) within a Fastify application.

## Install

```
npm i casbin fastify-casbin
```

> `casbin` is a peer dependency and must be installed explicitly

## API

Once registered, the plugin will decorate the Fastify instance with a `casbin` namespace which will be an instance of the `Enforcer` type.

It will expose the full Casbin API, primarily the [`enforce`](https://github.com/casbin/node-casbin#get-started) method, to check if a rule is satistifed.

## Examples

### Basic

Using basic [model](https://github.com/casbin/casbin/blob/master/examples/basic_model.conf) and [policy](https://github.com/casbin/casbin/blob/master/examples/basic_policy.csv) files.

```js
const fastify = require('fastify')()

fastify.register(require('fastify-casbin'), {
  model: 'basic_model.conf', // the model configuration
  adapter: 'basic_policy.csv' // the adapter
})

fastify.get('/protected', async () => {
  if (!(await fastify.casbin.enforce('alice', 'data1', 'read'))) {
    throw new Error('Forbidden')
  }

  return `You're in!`
})
```

### Postgres adapter and watcher

Using [casbin-pg-adapter](https://github.com/touchifyapp/casbin-pg-adapter) and [casbin-pg-watcher](https://github.com/mcollina/casbin-pg-watcher)

```js
const fastify = require('fastify')()
const { newAdapter } = require('casbin-pg-adapter').default
const { newWatcher } = require('casbin-pg-watcher')

const pgOptions = {
  connectionString: 'postgres://localhost'
  migrate: true
}

fastify.register(require('fastify-casbin'), {
  model: 'basic_model.conf', // the model configuration
  adapter: await newAdapter(pgOptions), // the adapter
  watcher: await newWatcher(pgOptions) // the watcher
})

// add some policies at application startup
fastify.addHook('onReady', async function () {
  await fastify.casbin.addPolicy('alice', 'data1', 'read')
})

fastify.get('/protected', async () => {
  if (!(await fastify.casbin.enforce('alice', 'data1', 'read'))) {
    throw new Error('Forbidden')
  }

  return `You're in!`
})
```

### Using programmatically assembled model

```typescript
import fastify from 'fastify'
import { join } from 'path'
import { Model, FileAdapter } from 'casbin'

const modelPath = join(__dirname, 'auth', 'basic_model.conf')
const policyPath = join(__dirname, 'auth', 'basic_policy.csv')

const app = fastify()

const preloadedModel = new Model()
preloadedModel.loadModel(modelPath)
const preloadedAdapter = new FileAdapter(policyPath)

fastify.register(plugin, {
  model: preloadedModel,
  adapter: preloadedAdapter
})

fastify.get('/protected', async () => {
  if (!(await fastify.casbin.enforce('alice', 'data1', 'read'))) {
    throw new Error('Forbidden')
  }

  return `You're in!`
})
```

## License

Licensed under [MIT License](./LICENSE)
