import { env } from '../utils/env'

export default {
  /**
   * DATABASE
   */
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

  /**
   * OTHER
   */
  adminUser: {
    username: env('ADMIN_USERNAME'),
    password: env('ADMIN_PASSWORD'),
    email: env('ADMIN_EMAIL'),
    givenNames: env('ADMIN_GIVEN_NAMES'),
    surname: env('ADMIN_SURNAME'),
  },

  clientUrl: env('CLIENT_URL'),
  components: [],
  corsOrigin: env('CORS_ORIGIN'),

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

  passwordResetRedirect: '/password-reset',

  port: env('SERVER_PORT', { type: 'number' }) || 3000,
  secret: env('SECRET')!,

  sentry: {
    dsn: env('SENTRY_DSN'),
    environment: env('SENTRY_ENVIRONMENT'),
  },

  serverUrl: env('SERVER_URL')!,
  staticFolders: [],
  suppressLoggerInTestEnv:
    env('SUPPRESS_LOGGER_IN_TEST_ENV', { type: 'boolean' }) || false,

  teams: {
    global: [
      {
        displayName: 'Admin',
        role: 'admin',
      },
    ],
    nonGlobal: [],
  },

  tokenExpiresIn: 24 * 3600,
  useGraphQLServer: true,

  // not typed yet
  // integrations
  // services
  // chatGPT
}
