/* eslint-disable no-param-reassign */

const configureApp = app => {
  app.get('/verify', (req, res) => res.send('hi'))

  // Actions to perform when the HTTP server starts listening
  app.onListen = async server => {
    // No-op
  }

  return app
}

module.exports = configureApp
