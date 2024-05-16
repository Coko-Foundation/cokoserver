exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('files')

    if (!tableExists) {
      await knex.schema.createTable('files', table => {
        table.uuid('id').primary()
        table
          .timestamp('created', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now())
        table.timestamp('updated', { useTz: true })
        table.text('type').notNullable()
        table.text('name').notNullable()
        table.jsonb('storedObjects').notNullable()
        table.jsonb('tags').defaultTo([])
        table.uuid('referenceId').nullable()
        table.uuid('objectId').nullable()
        table.text('alt').nullable()
        table.text('uploadStatus').nullable()
        table.text('caption').nullable()
      })
      return true
    }

    const hasId = await knex.schema.hasColumn('files', 'id')
    const hasCreated = await knex.schema.hasColumn('files', 'created')
    const hasUpdated = await knex.schema.hasColumn('files', 'updated')
    const hasType = await knex.schema.hasColumn('files', 'type')
    const hasName = await knex.schema.hasColumn('files', 'name')

    const hasStoredObjects = await knex.schema.hasColumn(
      'files',
      'stored_objects',
    )

    const hasTags = await knex.schema.hasColumn('files', 'tags')
    const hasReferenceId = await knex.schema.hasColumn('files', 'reference_id')
    const hasObjectId = await knex.schema.hasColumn('files', 'object_id')
    const hasAlt = await knex.schema.hasColumn('files', 'alt')

    const hasUploadStatus = await knex.schema.hasColumn(
      'files',
      'upload_status',
    )

    const hasCaption = await knex.schema.hasColumn('files', 'caption')

    await knex.schema.alterTable('files', table => {
      if (!hasId) {
        table.dropPrimary('files_pkey')
        table.uuid('id').primary()
      }

      if (!hasCreated) {
        table
          .timestamp('created', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now())
      }

      if (!hasUpdated) {
        table.timestamp('updated', { useTz: true })
      }

      if (!hasType) {
        table.text('type').notNullable()
      }

      if (!hasName) {
        table.text('name').notNullable()
      }

      if (!hasStoredObjects) {
        table.jsonb('storedObjects').notNullable()
      }

      if (!hasTags) {
        table.jsonb('tags').defaultTo([])
      }

      if (!hasReferenceId) {
        table.uuid('referenceId').nullable()
      }

      if (!hasObjectId) {
        table.uuid('objectId').nullable()
      }

      if (!hasAlt) {
        table.text('alt').nullable()
      }

      if (!hasUploadStatus) {
        table.text('uploadStatus').nullable()
      }

      if (!hasCaption) {
        table.text('caption').nullable()
      }
    })
    return true
  } catch (e) {
    throw new Error(`File: Initial: Migration failed! ${e}`)
  }
}

exports.down = async knex => {
  return knex.schema.dropTable('files')
}
