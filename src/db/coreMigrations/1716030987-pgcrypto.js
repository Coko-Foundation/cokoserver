exports.up = db => {
  return db.raw(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `)
}

exports.down = db => {
  return db.raw(`
    DROP EXTENSION IF EXISTS pgcrypto;
  `)
}
