exports.up = async knex => {
  return knex.transaction(async trx => {
    try {
      await trx.schema.createTable('coko_server_meta', table => {
        table.increments('id') // this will make id the primary key

        table
          .timestamp('created', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now())

        table
          .text('last_successful_migrate_checkpoint')
          .references('migrations.id')
      })

      /**
       * Table can only ever have a single row.
       *
       * The primary key (id) needs to be unique.
       * By making a constraint that the id is always 1 (the value of the first
       * row), we're effectively blocking the creation of any other row.
       */
      await trx.raw(`
        ALTER TABLE coko_server_meta
        ADD CONSTRAINT single_row_constraint 
        CHECK (id = 1)
      `)

      // add the single row
      await trx.raw(`
        INSERT INTO coko_server_meta DEFAULT VALUES
      `)

      await trx.commit()
    } catch (e) {
      await trx.rollback(e)
      throw e
    }
  })
}

exports.down = async knex => {
  return knex.schema.dropTable('coko_server_meta')
}
