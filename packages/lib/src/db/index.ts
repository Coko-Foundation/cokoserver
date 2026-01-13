import db from './db'
import { migrationManager } from './migrate'
import connectionConfig from './connectionConfig'

import {
  MIGRATIONS_TABLE,
  META_TABLE,
  migrationsMeta,
} from './migrateDbHelpers'

const getDbConnectionConfig = connectionConfig
const MIGRATIONS_TABLE_NAME = MIGRATIONS_TABLE
const META_TABLE_NAME = META_TABLE

export {
  db,
  migrationManager,
  getDbConnectionConfig,
  migrationsMeta,
  MIGRATIONS_TABLE_NAME,
  META_TABLE_NAME,
}
