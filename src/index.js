const { v4: uuid, validate: uuidValidate } = require('uuid')
const { withFilter } = require('graphql-subscriptions')

const { sendEmail } = require('./services/sendEmail')

const logger = require('./logger')
const { db, migrationManager } = require('./db')
const subscriptionManager = require('./graphql/pubsub')
const authentication = require('./authentication')
const { createFile, deleteFiles } = require('./models/file/file.controller')

const {
  BaseModel,
  User,
  Identity,
  Team,
  TeamMember,
  File,
  ChatChannel,
  ChatMessage,
  useTransaction,
} = require('./models')

const modelJsonSchemaTypes = require('./models/_helpers/types')
const clearDb = require('./models/_helpers/clearDb')
const tempFolderPath = require('./utils/tempFolderPath')
const fileStorage = require('./fileStorage')

const WaxToDocxConverter = require('./services/docx/docx.service')

const { jobManager } = require('./jobManager')

const activityLog = require('./services/activityLog')
const { isEnvVariableTrue } = require('./utils/env')
const request = require('./utils/request')

// const { serviceHandshake } = require('./helpers')

const { callMicroservice } = require('./utils/microservices')

const {
  authenticatedCall: makeOAuthCall,
} = require('./utils/authenticatedCall')

const {
  deleteFileFromTemp,
  emptyTemp,
  writeFileToTemp,
} = require('./utils/filesystem')

const { clientUrl, serverUrl } = require('./utils/urls')
const createGraphqlTestServer = require('./utils/createGraphqlTestServer')

const createJWT = authentication.token.create
const verifyJWT = authentication.token.verify

module.exports = {
  /* CORE FUNCTIONALITY */
  db,
  logger,

  /* MODELS */
  BaseModel,
  User,
  Identity,
  Team,
  TeamMember,
  File,
  ChatChannel,
  ChatMessage,
  modelJsonSchemaTypes,
  useTransaction,

  /* SERVICES */
  activityLog,
  jobManager,
  migrationManager,
  subscriptionManager,
  fileStorage,

  /* UTILS */
  isEnvVariableTrue,
  request,
  sendEmail,
  withFilter,
  uuid,
  uuidValidate,
  WaxToDocxConverter,
  clearDb,

  // file storage
  createFile,
  deleteFiles,

  // jwt
  createJWT,
  verifyJWT,

  // urls
  clientUrl,
  serverUrl,

  // microservices
  callMicroservice,
  makeOAuthCall,

  // teting
  createGraphqlTestServer,

  // temp folder
  tempFolderPath,
  deleteFileFromTemp,
  emptyTemp,
  writeFileToTemp,
}
