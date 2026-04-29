import { z } from 'zod'

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

  url: z.url(),
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
  from: z.string(),
  transport: MailerTransportSchema,
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

const IntegrationConfigSchema = z.strictObject({
  name: z.string(),
  clientId: z.string(),
  redirectUri: z.url(),
  tokenUrl: z.url(),
})

const SentrySchema = z.strictObject({
  dsn: z.string(),
  environment: z.string(),
})

const AdminUserSchema = z.strictObject({
  username: z.string(),
  password: z.string(),
  email: z.email(),
  givenNames: z.string().optional(),
  surname: z.string().optional(),
})

export const ConfigSchema = z.strictObject({
  // database
  db: DatabaseConfigSchema,
  subscriptionsDb: SubscriptionsDatabaseConfigSchema.optional(),
  // pool: KnexPoolConfigSchema.optional(),
  acquireConnectionTimeout: z.number().int().nonnegative().optional(),

  adminUser: z.union([AdminUserSchema, z.literal(false)]),
  clientUrl: z.url().optional(),
  components: z.array(z.string()),
  corsOrigin: z.union([z.string(), z.array(z.string())]).optional(),
  fileStorage: z.union([FileStorageConfigSchema, z.literal(false)]),
  mailer: z.union([MailerConfigSchema, z.literal(false)]),
  passwordResetRedirect: z.string(),
  port: z.number().int().positive(),
  secret: z.string(),
  sentry: z.union([SentrySchema, z.literal(false)]),
  serverUrl: z.url(),
  staticFolders: z.array(StaticFolderSchema),
  suppressLoggerInTestEnv: z.boolean(),
  teams: TeamsConfigSchema,
  tokenExpiresIn: z.number().int().nonnegative(),
  useGraphQLServer: z.boolean(),

  // drop
  integrations: z.array(IntegrationConfigSchema).optional(),
})

export type Teams = z.infer<typeof TeamsConfigSchema>
export type MailerTransport = z.infer<typeof MailerTransportSchema>
export type FileStorageConfig = z.infer<typeof FileStorageConfigSchema>
export type ConfigType = z.infer<typeof ConfigSchema>
export type AdminUser = z.infer<typeof AdminUserSchema>
