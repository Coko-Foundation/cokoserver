import { BatchFns, buildLoaders } from './loaders'

type ContextArgs = {
  req?: any
  res?: any
}

type GraphqlContext = {
  userId?: string | null
  loaders: Record<string, any>
  req?: any
  res?: any
}

const createContextFactory = (
  batchFns: BatchFns,
): ((args?: ContextArgs) => Promise<GraphqlContext>) => {
  return async ({ req, res } = {}) => {
    return {
      userId: req?.user, // req.user is set by passport
      // Fresh loaders for every request, so that caches are not shared
      loaders: buildLoaders(batchFns),
      req,
      res,
    }
  }
}

export default createContextFactory
