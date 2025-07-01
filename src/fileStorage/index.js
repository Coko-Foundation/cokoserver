const fileStorage = require('./helpers/fileStorage')
const getFileStorage = require('./helpers/getFileStorage')

/**
 * PREVIOUSLY EXPORTED FUNCTIONS
 */

// const fileStorage = {
//   deleteFiles: fileStorageDeleteFiles,
//   download,
//   healthCheck,
//   getURL,

//   upload,
//   list,
// }

module.exports = { fileStorage, getFileStorage }
