export const cleanUndefined = (object: object): object =>
  Object.keys(object)
    .filter(k => object[k] !== undefined)
    .reduce((acc, k) => {
      acc[k] = object[k]
      return acc
    }, {})

export const displayNameConstructor = (
  givenNames: string,
  surname: string,
  username: string,
): string => {
  if (givenNames && surname) return `${givenNames} ${surname}`
  if (username) return username

  throw new Error('User model: Cannot get displayName')
}
