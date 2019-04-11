import knex from 'knex'
import joinMonster from 'join-monster'

import config from './knexfile'

const { NODE_ENV = 'development' } = process.env
export const db = knex(config[NODE_ENV])
export const dialect = db._context.client.config.client
export default db

// wrapper to centralize all raw SQL calls and log them
const dbRaw = db.raw
db.raw = (...args) => {
  console.log('SQL', args)
  return dbRaw.apply(db, args)
}

// generic joinMonster resolver
export const sqlResolver = (parent, args, ctx, resolveInfo) => {
  return joinMonster(resolveInfo, args, sql => ctx.knex.raw(sql), { dialect })
}

// generic where clause
export const fieldWhere = (table, args) => `${table}.id = ${args.id}`