type EnvOptions = { type?: 'number' | 'boolean' }

export function env(name: string, options: { type: 'number' }): number
export function env(name: string, options: { type: 'boolean' }): boolean

export function env(
  name: string,
  options?: Omit<EnvOptions, 'type'>,
): string | undefined

export function env(
  name: string,
  options: EnvOptions = {},
): string | boolean | number | undefined {
  const value = process.env[name]

  if (options.type === 'boolean') {
    if (value) return true
    return false
  }

  if (options.type === 'number') {
    const num = Number(value)
    /* eslint-disable-next-line consistent-return */
    if (isNaN(num)) return
    return num
  }

  /* eslint-disable-next-line consistent-return */
  if (typeof value === 'string' && value.length === 0) return
  return value
}

export function isEnvVariableTrue(variable: any): boolean | string {
  return variable === true || variable === 'true' || variable === '1'
}

export function isTrue(value: any): boolean | string {
  return isEnvVariableTrue(value)
}

export function isValidPositiveIntegerOrZero(n: any): boolean {
  const value = Number(n)
  return Number.isInteger(value) && n >= 0
}
