const cron = require('node-cron')
const { v4: uuid } = require('uuid')

const { send: sendEmail } = require('./services/sendEmail')

const logger = require('./logger')
const db = require('./dbManager/db')
const { migrate } = require('./dbManager/migrate')
const pubsubManager = require('./graphql/pubsub')
const authentication = require('./authentication')
const { File } = require('./models')
const { createFile, deleteFiles } = require('./models/file/file.controller')

const { boss, connectToJobQueue } = require('./jobs')
const { BaseModel, useTransaction } = require('./models')
const modelJsonSchemaTypes = require('./models/_helpers/types')
const tempFolderPath = require('./utils/tempFolderPath')

const {
  healthCheck,
  getURL,
  upload,
  deleteFiles: fileStorageDeleteFiles,
  list,
  download,
} = require('./services/fileStorage')

const WaxToDocxConverter = require('./services/docx/docx.service')

const activityLog = require('./services/activityLog')
const { isEnvVariableTrue } = require('./utils/env')
const request = require('./utils/request')

// Do not expose connectToFileStorage
const fileStorage = {
  healthCheck,
  getURL,
  upload,
  deleteFiles: fileStorageDeleteFiles,
  list,
  download,
}

// const { serviceHandshake } = require('./helpers')

const { callMicroservice } = require('./utils/microservices')

const {
  authenticatedCall: makeOAuthCall,
} = require('./utils/authenticatedCall')

const { clientUrl, serverUrl } = require('./utils/urls')

const createJWT = authentication.token.create
const verifyJWT = authentication.token.verify

module.exports = {
  createJWT,
  verifyJWT,
  pubsubManager,
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
  migrate,
  useTransaction,
  isEnvVariableTrue,
  request,
  tempFolderPath,

  cron,
  uuid,

  boss,
  connectToJobQueue,

  callMicroservice,
  makeOAuthCall,
  WaxToDocxConverter,

  clientUrl,
  serverUrl,
}
