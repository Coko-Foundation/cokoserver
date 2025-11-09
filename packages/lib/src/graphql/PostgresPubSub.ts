/**
 * Code courtesy of the authors in this repo:
 * https://github.com/GraphQLCollege/graphql-postgres-subscriptions/blob/master/postgres-pubsub.js
 *
 * Repo seems abandoned, so moved here to be able to keep dependencies up to date.
 */

import { PubSub } from 'graphql-subscriptions'
import { Client, type ClientConfig } from 'pg'
import pgIPC from 'pg-ipc'

import { eventEmitterAsyncIterator } from './event-emitter-to-async-iterator'

const defaultCommonMessageHandler = (message: string): string => message

type OptionsClientExtension = {
  client?: Client
}

type PostgresPubSubOptions = ClientConfig & OptionsClientExtension

class PostgresPubSub extends PubSub {
  client: Client
  commonMessageHandler = defaultCommonMessageHandler
  subscriptions = {}
  subIdCounter: number = 0

  constructor(options: PostgresPubSubOptions = {}) {
    const { client, ...pgOptions } = options
    super()

    this.client = client || new Client(pgOptions)
    if (!client) this.client.connect()

    /* eslint-disable-next-line new-cap */
    this.ee = new pgIPC(this.client)
  }

  // @ts-ignore
  publish(triggerName: string, payload: any): boolean {
    // @ts-ignore
    this.ee.notify(triggerName, payload)
    return true
  }

  subscribe(
    triggerName: string,
    onMessage: (...args: any[]) => void,
  ): Promise<number> {
    const callback = (message): void => {
      onMessage(
        message instanceof Error
          ? message
          : this.commonMessageHandler(message.payload),
      )
    }

    this.ee.on(triggerName, callback)
    this.subIdCounter += 1
    this.subscriptions[this.subIdCounter] = [triggerName, callback]
    return Promise.resolve(this.subIdCounter)
  }

  unsubscribe(subId: number): void {
    const [triggerName, onMessage] = this.subscriptions[subId]
    delete this.subscriptions[subId]
    this.ee.removeListener(triggerName, onMessage)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  asyncIterator(triggers) {
    return eventEmitterAsyncIterator(
      this.ee,
      triggers,
      this.commonMessageHandler,
    )
  }
}

export default PostgresPubSub
