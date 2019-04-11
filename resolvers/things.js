export default {
  Query: {
    thing: (parent, args) => args,
    things: (parent, args) => args
  },

  Mutation: {
    createThing: async (parent, { input }, ctx, resolveInfo) => {
      const [id] = await ctx.knex('things').insert(input)
      return { id }
    },

    updateThing: async (parent, { input: { id, ...updates } }, ctx, resolveInfo) => {
      await ctx.knex('things').where({ id }).update(updates)
      return { id }
    },

    deleteThing: async (parent, { id }, ctx, resolveInfo) => {
      const _filled = await sqlResolver(parent, { id }, ctx, resolveInfo)
      await await ctx.knex('things').where({ id }).del()
      // there will not be a record after this, so I look it up first and return it with _filled
      return { _filled }
    }
  }
}