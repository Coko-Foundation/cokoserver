const cleanUndefined = object =>
  Object.keys(object)
    .filter(k => object[k] !== undefined)
    .reduce((acc, k) => {
      acc[k] = object[k]
      return acc
    }, {})

module.exports = { cleanUndefined }
