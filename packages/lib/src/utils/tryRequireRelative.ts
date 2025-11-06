import path from 'path'

const tryRequireRelative = async componentPath => {
  try {
    const p = path.join(process.cwd(), componentPath)
    const { default: component } = await import(p)
    return component
  } catch (e) {
    throw new Error(
      `Unable to load component ${componentPath} on the server. ${e}`,
    )
  }
}

export default tryRequireRelative
