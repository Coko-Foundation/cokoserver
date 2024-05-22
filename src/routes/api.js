const express = require('express')
const helmet = require('helmet')

const api = express.Router({ mergeParams: true })

api.use(helmet())

module.exports = api
