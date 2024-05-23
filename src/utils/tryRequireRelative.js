const tryRequireRelative = componentPath => {
  try {
    /* eslint-disable-next-line import/no-dynamic-require, global-require */
    const component = require(require.resolve(componentPath, {
      paths: [process.cwd()],
    }))

    return component
  } catch (e) {
    throw new Error(
      `Unable to load component ${componentPath} on the server. ${e}`,
    )
  }
}

module.exports = tryRequireRelative
