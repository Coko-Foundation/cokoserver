exports.up = db => {
  return db.raw(`
    DROP TABLE IF EXISTS entities;
  `)
}

exports.down = db => {
  return db.raw(`
    CREATE TABLE IF NOT EXISTS entities (id UUID PRIMARY KEY, data JSONB);
  `)
}
