import { Client } from 'pg'

class PostgresPubSubNoop {
  client: Client

  /* eslint-disable-next-line class-methods-use-this */
  error(): void {
    throw new Error(
      'Cannot use the Subscription Manager when useGraphQLServer is false in the config',
    )
  }

  publish(): void {
    this.error()
  }

  subscribe(): void {
    this.error()
  }

  unsubscribe(): void {
    this.error()
  }

  asyncIterator(): void {
    this.error()
  }
}

export default PostgresPubSubNoop
