/**
 * Code starting point (though modified for typescript) courtesy of the authors in this repo:
 * https://github.com/GraphQLCollege/graphql-postgres-subscriptions/blob/master/postgres-pubsub.js
 *
 * Repo seems abandoned, so moved here to be able to keep dependencies up to date.
 */

import { EventEmitter } from 'events'

import { PubSubEngine } from 'graphql-subscriptions'
import { Client, type ClientConfig } from 'pg'
import PgIPC from 'pg-ipc'

interface PgIPCInstance extends EventEmitter {
  notify(channel: string, payload?: any): void
  send(channel: string, payload?: any): void
  end(): void
}

type OptionsClientExtension = {
  client?: Client
}

type PostgresPubSubOptions = ClientConfig & OptionsClientExtension
type MessageHandler<T = any> = (message: any) => T

const defaultCommonMessageHandler: MessageHandler = (message: string): string =>
  message

function eventEmitterAsyncIterator<T = any>(
  eventEmitter: PgIPCInstance,
  eventsNames: string | string[],
  commonMessageHandler: MessageHandler,
): AsyncIterableIterator<T> {
  const pullQueue: Array<(value: IteratorResult<T>) => void> = []
  const pushQueue: T[] = []

  const eventsArray =
    typeof eventsNames === 'string' ? [eventsNames] : eventsNames

  let listening = true

  const pushValue = ({ payload: event }: { payload: any }): void => {
    const value = commonMessageHandler(event)

    if (pullQueue.length !== 0) {
      pullQueue.shift()({ value, done: false })
    } else {
      pushQueue.push(value)
    }
  }

  const pullValue = (): Promise<IteratorResult<T>> => {
    return new Promise(resolve => {
      if (pushQueue.length !== 0) {
        resolve({ value: pushQueue.shift() as T, done: false })
      } else {
        pullQueue.push(resolve)
      }
    })
  }

  const emptyQueue = (): void => {
    if (listening) {
      listening = false
      removeEventListeners()
      pullQueue.forEach(resolve =>
        resolve({ value: undefined as any, done: true }),
      )
      pullQueue.length = 0
      pushQueue.length = 0
    }
  }

  const addEventListeners = (): void => {
    for (const eventName of eventsArray) {
      eventEmitter.addListener(eventName, pushValue)
    }
  }

  const removeEventListeners = (): void => {
    for (const eventName of eventsArray) {
      eventEmitter.removeListener(eventName, pushValue)
    }
  }

  addEventListeners()

  return {
    next(): Promise<IteratorResult<T>> {
      return listening ? pullValue() : this.return!()
    },

    return(): Promise<IteratorResult<T>> {
      emptyQueue()
      return Promise.resolve({ value: undefined, done: true })
    },

    throw(error: any): Promise<IteratorResult<T>> {
      emptyQueue()
      return Promise.reject(error)
    },

    /* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
    [Symbol.asyncIterator]() {
      return this
    },
  }
}

class PostgresPubSub extends PubSubEngine {
  client: Client
  protected ee: PgIPCInstance
  private subscriptions: { [key: string]: [string, (...args: any[]) => void] }
  private subIdCounter: number
  commonMessageHandler = defaultCommonMessageHandler

  constructor(options: PostgresPubSubOptions = {}) {
    super()

    this.subscriptions = {}
    this.subIdCounter = 0

    const { client, ...pgOptions } = options
    this.client = client || new Client(pgOptions)
    if (!client) this.client.connect()

    this.ee = new PgIPC(this.client)
  }

  public publish(triggerName: string, payload: any): Promise<void> {
    this.ee.notify(triggerName, payload)
    return Promise.resolve()
  }

  public subscribe(
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

  public unsubscribe(subId: number): void {
    const [triggerName, onMessage] = this.subscriptions[subId]
    delete this.subscriptions[subId]
    this.ee.removeListener(triggerName, onMessage)
  }

  public asyncIterator<T = any>(
    triggers: string | string[],
  ): AsyncIterableIterator<T> {
    return eventEmitterAsyncIterator<T>(
      this.ee,
      triggers,
      this.commonMessageHandler,
    )
  }
}

export default PostgresPubSub
