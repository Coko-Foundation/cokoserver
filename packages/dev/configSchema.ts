import { z } from '@coko/server'

const schema = z.strictObject({
  random: z.boolean(),
})

export default schema
