import { env } from '../utils/env'

export default {
  db: {
    host: env('POSTGRES_HOST')!,
    port: env('POSTGRES_PORT', { type: 'number' })!,
    database: env('POSTGRES_DB')!,
    user: env('POSTGRES_USER')!,
    password: env('POSTGRES_PASSWORD')!,

    allowSelfSignedCertificates: env(
      'POSTGRES_ALLOW_SELF_SIGNED_CERTIFICATES',
      { type: 'boolean' },
    ),
    caCert: env('POSTGRES_CA_CERT'),
  },
  subscriptionsDb: {
    host: env('SUBSCRIPTIONS_POSTGRES_HOST'),
    port: env('SUBSCRIPTIONS_POSTGRES_PORT', { type: 'number' }),
    database: env('SUBSCRIPTIONS_POSTGRES_DB'),
    user: env('SUBSCRIPTIONS_POSTGRES_USER'),
    password: env('SUBSCRIPTIONS_POSTGRES_PASSWORD'),

    allowSelfSignedCertificates: env(
      'SUBSCRIPTIONS_POSTGRES_ALLOW_SELF_SIGNED_CERTIFICATES',
      { type: 'boolean' },
    ),
    caCert: env('SUBSCRIPTIONS_POSTGRES_CA_CERT'),
  },
  // pool
  acquireConnectionTimeout: 5000,

  fileStorage: {
    accessKeyId: env('S3_ACCESS_KEY_ID')!,
    secretAccessKey: env('S3_SECRET_ACCESS_KEY')!,

    url: env('S3_URL')!,
    bucket: env('S3_BUCKET')!,
    region: env('S3_REGION'),

    maximumWidthForSmallImages:
      env('MAXIMUM_WIDTH_FOR_SMALL_IMAGES', { type: 'number' }) || 180,
    maximumWidthForMediumImages:
      env('MAXIMUM_WIDTH_FOR_MEDIUM_IMAGES', { type: 'number' }) || 640,

    s3ForcePathStyle: env('S3_FORCE_PATH_STYLE', { type: 'boolean' }) || true,
    s3SeparateDeleteOperations:
      env('S3_SEPARATE_DELETE_OPERATIONS', {
        type: 'boolean',
      }) || false,
  },

  mailer: {
    from: env('MAILER_SENDER')!,
    transport: {
      host: env('MAILER_HOSTNAME')!,
      port: env('MAILER_PORT', { type: 'number' })!,
      auth: {
        user: env('MAILER_USER')!,
        pass: env('MAILER_PASSWORD')!,
      },
    },
  },

  port: env('SERVER_PORT', { type: 'number' }) || 3000,
  secret: env('SECRET')!,
  serverUrl: env('SERVER_URL')!,
  clientUrl: env('CLIENT_URL'),
  corsOrigin: env('CORS_ORIGIN'),

  useGraphQLServer: true,
  // useFileStorage: true,

  tokenExpiresIn: 24 * 3600,
  emailVerificationTokenExpiry: {
    amount: 24,
    unit: 'hours' as const,
  },
  passwordResetTokenExpiry: {
    amount: 24,
    unit: 'hours' as const,
  },
  passwordReset: {
    path: env('PASSWORD_RESET_PATH') || '/password-reset',
  },

  teams: {
    global: [
      {
        displayName: 'Admin',
        role: 'admin',
      },
    ],
    nonGlobal: [],
  },
  components: [],
  staticFolders: [],
  suppressLoggerInTestEnv:
    env('SUPPRESS_LOGGER_IN_TEST_ENV', { type: 'boolean' }) || false,

  // not typed yet
  // schema
  // integrations
  // services
  // chatGPT
  // dbConnectionReporter

  // move out
  // jobQueues
  // permissions
}
