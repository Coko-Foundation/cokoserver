export const cleanUndefined = (object: object): object =>
  Object.keys(object)
    .filter(k => object[k] !== undefined)
    .reduce((acc, k) => {
      acc[k] = object[k]
      return acc
    }, {})
