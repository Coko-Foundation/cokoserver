import { z } from 'zod'
import { isValidCron } from 'cron-validator'

const cron = z
  .string()
  .refine(val => isValidCron(val, { alias: true, seconds: false }), {
    message: 'Invalid cron string',
  })

// Zod doesn't have a specific type for Knex.PoolConfig, so we define it loosely
// or only include the fields you intend to validate.
// For simplicity here, we'll allow any object, but you should refine this
// if you need validation for specific Knex pool properties.
// const KnexPoolConfigSchema = z.record(z.any()).optional();

const DatabaseConfigSchema = z.strictObject({
  host: z.string(),
  port: z.number().int().positive(),
  database: z.string(),
  user: z.string(),
  password: z.string(),

  allowSelfSignedCertificates: z.boolean().optional(),
  caCert: z.string().optional(),
})

const SubscriptionsDatabaseConfigSchema = z.strictObject({
  host: z.string().optional(),
  port: z.number().int().positive().optional(),
  database: z.string().optional(),
  user: z.string().optional(),
  password: z.string().optional(),

  allowSelfSignedCertificates: z.boolean().optional(),
  caCert: z.string().optional(),
})

const FileStorageConfigSchema = z.strictObject({
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),

  url: z.string().url(),
  bucket: z.string(),
  region: z.string().optional(),

  maximumWidthForSmallImages: z.number().int().nonnegative(),
  maximumWidthForMediumImages: z.number().int().nonnegative(),

  s3ForcePathStyle: z.boolean(),
  s3SeparateDeleteOperations: z.boolean(),
})

const MailerTransportAuthSchema = z.strictObject({
  user: z.string(),
  pass: z.string(),
})

const MailerTransportSchema = z.strictObject({
  host: z.string(),
  port: z.number().int().positive(),
  auth: MailerTransportAuthSchema,
})

const MailerConfigSchema = z.strictObject({
  from: z.string().email(),
  transport: MailerTransportSchema,
})

const TokenExpirySchema = z.strictObject({
  amount: z.number().int().nonnegative(),
  unit: z.enum(['minutes', 'hours', 'days']),
})

const PasswordResetConfigSchema = z.strictObject({
  path: z.string(),
})

const TeamConfigSchema = z.strictObject({
  displayName: z.string(),
  role: z.string(),
})

const TeamsConfigSchema = z.strictObject({
  global: z.array(TeamConfigSchema),
  nonGlobal: z.array(TeamConfigSchema),
})

const StaticFolderSchema = z.strictObject({
  folderPath: z.string(),
  mountPoint: z.string(),
})

const IntegrationConfigSchema = z.object({
  clientId: z.string(),
  redirectUri: z.url(),
  tokenUrl: z.url(),
})

const LifeCycleScript = z.object({
  label: z.string(),
  execute: z.function(),
})

const JobQueue = z.object({
  name: z.string(),
  handler: z.function(),
  teamSize: z.number().int().positive().optional(),
  teamConcurrency: z.number().int().positive().optional(),
  schedule: cron.optional(),
  scheduleTimezone: z.string().optional(),
})

export const ConfigSchema = z.strictObject({
  db: DatabaseConfigSchema,
  subscriptionsDb: SubscriptionsDatabaseConfigSchema.optional(),
  // pool: KnexPoolConfigSchema.optional(),
  acquireConnectionTimeout: z.number().int().nonnegative().optional(),

  fileStorage: z.union([FileStorageConfigSchema, z.literal(false)]),
  mailer: z.union([MailerConfigSchema, z.literal(false)]),

  port: z.number().int().positive(),
  secret: z.string(),
  serverUrl: z.url(),
  clientUrl: z.url().optional(),
  corsOrigin: z.string().optional(),

  useGraphQLServer: z.boolean(),
  suppressLoggerInTestEnv: z.boolean(),

  tokenExpiresIn: z.number().int().nonnegative(),
  emailVerificationTokenExpiry: TokenExpirySchema,
  passwordResetTokenExpiry: TokenExpirySchema,
  passwordReset: PasswordResetConfigSchema.optional(),

  teams: TeamsConfigSchema,
  components: z.array(z.string()),
  staticFolders: z.array(StaticFolderSchema),

  integrations: z.record(z.string(), IntegrationConfigSchema).optional(),
  onStartup: z.array(LifeCycleScript).optional(),
  onShutdown: z.array(LifeCycleScript).optional(),
  jobQueues: z.array(JobQueue).optional(),
  permissions: z.object().optional(),
})

export type ConfigType = z.infer<typeof ConfigSchema>
