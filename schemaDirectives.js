import { SchemaDirectiveVisitor } from 'graphql-tools'
import { pluralize, underscore } from 'inflection'
import joinMonster from 'join-monster'

const where = (table, args, obj) => `${table}.id = ${args.id || obj.id}`

class SqlDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const oldResolver = field.resolve
    // field.where = where
    field.resolve = async (parent, args, ctx, resolveInfo) => {
      const { _filled, ...newargs } = await oldResolver(parent, args, ctx, resolveInfo)
      if (_filled) {
        return _filled
      }
      return joinMonster(resolveInfo, newargs, sql => ctx.knex.raw(sql), { dialect: ctx.knex._context.client.config.client })
    }
  }

  // this handles top-level type-defitions for join-monster
  visitObject(obj) {
    const typeConfig = obj._typeConfig
    typeConfig.sqlTable = this.args.table || underscore(pluralize(obj.name))
    typeConfig.uniqueKey = this.args.key || 'id'
    if (this.args.alwaysFetch) {
      typeConfig.alwaysFetch = this.args.alwaysFetch
    }

    for (let fieldName in obj._fields) {
      if (fieldName !== typeConfig.uniqueKey) {
        Object.assign(obj._fields[fieldName], { sqlColumn: fieldName, where })
      }
    }
  }
}

export default { sql: SqlDirective }
