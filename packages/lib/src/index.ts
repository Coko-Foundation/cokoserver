import { v4 as uuid, validate as uuidValidate } from 'uuid'
import { z } from 'zod'
import {
  Express,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express'

import { withFilter } from 'graphql-subscriptions'
import { sendEmail } from './services/sendEmail'
import logger from './logger'
import { db, type Db, migrationManager } from './db'
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
  type JSONSchema,
  type QueryResult,
  type Pojo,
  type RelationMappings,
  type Transaction,
} from './models'

import * as modelJsonSchemaTypes from './models/_helpers/types'
import DbTestUtils from './db/DbTestUtils'
import fileStorage from './fileStorage'
import FileStorageConstructor from './fileStorage/FileStorage'

import WaxToDocxConverter from './services/docx/docx.service'

import { jobManager, type JobQueue } from './jobManager'

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

import { clientUrl, serverUrl, initUrls } from './utils/urls'
import createGraphqlTestServer from './utils/createGraphqlTestServer'

import { type FileStorageConfig } from './configManager/configSchema'

import config from './configManager/config'
import * as authorization from './authorization'
import * as Wax from './services/docx/waxDocumentTypes'

const createJWT = authentication.token.create
const verifyJWT = authentication.token.verify

type App = Express

/* eslint-disable-next-line @typescript-eslint/no-redeclare */
namespace App {
  export type Request = ExpressRequest
  export type Response = ExpressResponse
}

export {
  /* CORE FUNCTIONALITY */
  db,
  type Db,
  logger,
  config,
  authorization,
  z,
  type App,

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
  type JSONSchema,
  type QueryResult,
  type Pojo,
  type RelationMappings,
  type Transaction,

  /* SERVICES */
  activityLog,
  jobManager,
  type JobQueue,
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
  type Wax,
  DbTestUtils,

  // file storage
  fileStorage,
  createFile,
  deleteFiles,
  FileStorageConstructor,
  type FileStorageConfig,

  // jwt
  createJWT,
  verifyJWT,

  // urls
  clientUrl,
  serverUrl,
  initUrls,

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
