import '@babel/polyfill'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import merge from 'lodash.merge'
import { mergeTypes } from 'merge-graphql-schemas'
import { makeExecutableSchema } from 'graphql-tools'
import joinMonsterAdapt from 'join-monster-graphql-tools-adapter'

import knex from './db'

// this might all seem a bit over-engineered for a simple single-graphql type with CRUD
// but it adds up when you have a bunch

import rThings from './resolvers/things'
import tThings from './schema/things.graphql'

const typeDefs = mergeTypes(
  [
    tThings
    // put more types here
  ],
  { all: true }
)

const { _sql, ...resolvers } = merge(
  {},
  rThings
  // put more resolvers here
)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

if (_sql) {
  joinMonsterAdapt(schema, _sql)
}

const server = new ApolloServer({
  schema,
  introspection: true,
  playground: true,
  context: orig => ({ ...orig, knex })
})

const app = express()
server.applyMiddleware({ app })

const { PORT = 3000 } = process.env
app.listen(PORT)
console.log(`Listening on http://localhost:${PORT}/graphql`)
