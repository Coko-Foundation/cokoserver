import { v4 as uuid, validate as uuidValidate } from 'uuid'
import { z } from 'zod'

import { withFilter } from 'graphql-subscriptions'
import { sendEmail } from './services/sendEmail'
import logger from './logger'
import { db, migrationManager } from './db'
import subscriptionManager from './graphql/pubsub'
import authentication from './authentication'
import { createFile, deleteFiles } from './models/file/file.controller'

import {
  BaseModel,
  User,
  Identity,
  Team,
  TeamMember,
  File,
  ChatChannel,
  ChatMessage,
  useTransaction,
} from './models'

import * as modelJsonSchemaTypes from './models/_helpers/types'
import DbTestUtils from './db/DbTestUtils'
import fileStorage from './fileStorage'
import FileStorageConstructor from './fileStorage/FileStorage'

import WaxToDocxConverter from './services/docx/docx.service'

import { jobManager } from './jobManager'

import activityLog from './services/activityLog'
import { env } from './utils/env'
import request from './utils/request'

import { callMicroservice } from './utils/microservices'

import { authenticatedCall as makeOAuthCall } from './utils/authenticatedCall'

import {
  deleteFileFromTemp,
  emptyTemp,
  writeFileToTemp,
  tempFolderPath,
} from './utils/filesystem'

import { clientUrl, serverUrl } from './utils/urls'
import createGraphqlTestServer from './utils/createGraphqlTestServer'

import config from './configManager/config'
import * as authorization from './authorization'

const createJWT = authentication.token.create
const verifyJWT = authentication.token.verify

export {
  /* CORE FUNCTIONALITY */
  db,
  logger,
  config,
  authorization,
  z,

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

  /* UTILS */
  env,
  request,
  sendEmail,
  withFilter,
  uuid,
  uuidValidate,
  WaxToDocxConverter,
  DbTestUtils,

  // file storage
  fileStorage,
  createFile,
  deleteFiles,
  FileStorageConstructor,

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
