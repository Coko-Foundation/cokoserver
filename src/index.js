const { v4: uuid } = require('uuid')

const { send: sendEmail } = require('./services/sendEmail')

const logger = require('./logger')
const { db, migrationManager } = require('./db')
const subscriptionManager = require('./graphql/pubsub')
const authentication = require('./authentication')
const { File } = require('./models')
const { createFile, deleteFiles } = require('./models/file/file.controller')

const { BaseModel, useTransaction } = require('./models')
const modelJsonSchemaTypes = require('./models/_helpers/types')
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
const graphqlTestServer = require('./utils/graphqlTestServer')

const createJWT = authentication.token.create
const verifyJWT = authentication.token.verify

module.exports = {
  createJWT,
  verifyJWT,
  subscriptionManager,
  modelJsonSchemaTypes,
  fileStorage,
  createFile,
  deleteFiles,
  // serviceHandshake,
  sendEmail,
  activityLog,
  BaseModel,
  File,
  logger,
  db,
  migrationManager,
  useTransaction,
  isEnvVariableTrue,
  request,
  tempFolderPath,

  uuid,
  jobManager,

  callMicroservice,
  makeOAuthCall,
  WaxToDocxConverter,

  clientUrl,
  serverUrl,
  graphqlTestServer,

  deleteFileFromTemp,
  emptyTemp,
  writeFileToTemp,
}
