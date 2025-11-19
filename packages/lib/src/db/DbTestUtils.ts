import db from './db'
import config from '../configManager/config'

export default class DbTestUtils {
  static checkEnv(): void {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('DbTestUtils should only be used in test environments!')
    }
  }

  static async dropAllTables(): Promise<void> {
    DbTestUtils.checkEnv()

    await db.raw(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO "${config.get('db.user')}";
      GRANT ALL ON SCHEMA public TO public;
    `)
  }

  static async clearDb(): Promise<void> {
    DbTestUtils.checkEnv()

    await db.raw(`
      DO
      $$
      DECLARE
          tabname text;
      BEGIN
          FOR tabname IN
              SELECT tablename
              FROM pg_tables
              WHERE schemaname = 'public'
                AND tablename NOT IN ('migrations', 'coko_server_meta')
          LOOP
              EXECUTE format('TRUNCATE TABLE %I.%I RESTART IDENTITY CASCADE;', 'public', tabname);
          END LOOP;
      END;
      $$;  
    `)
  }
}
