export function isValidPositiveIntegerOrZero(n: any): boolean {
  const value = Number(n)
  return Number.isInteger(value) && n >= 0
}
