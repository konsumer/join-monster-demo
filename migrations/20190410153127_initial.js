
exports.up = async ({ schema }, Promise) => {
  await schema.createTable('things', t => {
    t.increments('id').unsigned().primary()
    t.string('title').notNull()
  })
};

exports.down = async ({ schema }, Promise) => {
  await schema.dropTable('things')
};
