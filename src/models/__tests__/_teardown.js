const db = require('../../dbManager/db')

module.exports = async () => {
  await db.destroy()
}
