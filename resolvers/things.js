import { sqlResolver, fieldWhere } from '../db'

export default {
  Query: {
    thing: sqlResolver,
    things: sqlResolver
  },

  Mutation: {
    createThing: async (parent, { input }, ctx, resolveInfo) => {
      const [id] = await ctx.knex('things').insert(input)
      return sqlResolver(parent, { id }, ctx, resolveInfo)
    },

    updateThing: async (parent, { input: { id, ...updates } }, ctx, resolveInfo) => {
      await ctx.knex('things').where({ id }).update(updates)
      return sqlResolver(parent, { id }, ctx, resolveInfo)
    },

    deleteThing: async (parent, { id }, ctx, resolveInfo) => {
      const changed = await sqlResolver(parent, { id }, ctx, resolveInfo)
      await ctx.knex('things').select('*').where({ id }).del()
      // there will not be a record after this, so I look it up first and return it with _filled
      return changed
    }
  },

  // adapt db-model
  // https://github.com/acarl005/join-monster-graphql-tools-adapter
  // TODO: eventually this could be automated using a decorator or something
  _sql: {
    Thing: {
      sqlTable: 'things',
      uniqueKey: 'id',
      where: fieldWhere,
      fields: {
        title: { sqlColumn: 'title' }
      }
    },

    Query: {
      fields: {
        thing: { where: fieldWhere }
      }
    },

    Mutation: {
      fields: {
        createThing: { where: fieldWhere },
        updateThing: { where: fieldWhere },
        deleteThing: { where: fieldWhere }
      }
    }
  }
}