import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import os from 'os'
import path from 'path'
import fs from 'fs/promises'

import MigrationRunner from '../migrationRunner'

describe('Migration runner', () => {
  let appDir: string

  beforeEach(async () => {
    appDir = await fs.mkdtemp(path.join(os.tmpdir(), 'migration-runner-'))
    await fs.mkdir(path.join(appDir, 'models', 'thing', 'migrations'), {
      recursive: true,
    })

    await fs.mkdir(path.join(appDir, 'dist', 'models', 'thing', 'migrations'), {
      recursive: true,
    })

    vi.spyOn(process, 'cwd').mockReturnValue(appDir)
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    await fs.rm(appDir, { recursive: true, force: true })
  })

  it('resolves relative component migrations from dist in production', () => {
    vi.stubEnv('NODE_ENV', 'production')

    const runner = new MigrationRunner(['./models/thing'])

    expect(runner.pattern).toContain(
      path.join(appDir, 'dist', 'models', 'thing', 'migrations'),
    )

    expect(runner.pattern).not.toContain(
      path.join(appDir, 'models', 'thing', 'migrations'),
    )
  })

  it('resolves relative component migrations from the app root outside production', () => {
    vi.stubEnv('NODE_ENV', 'development')

    const runner = new MigrationRunner(['./models/thing'])

    expect(runner.pattern).toContain(
      path.join(appDir, 'models', 'thing', 'migrations'),
    )

    expect(runner.pattern).not.toContain(path.join(appDir, 'dist'))
  })
})
