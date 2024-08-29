class PostgresPubSubNoop {
  /* eslint-disable-next-line class-methods-use-this */
  error() {
    throw new Error(
      'Cannot use the Subscription Manager when useGraphQLServer is false in the config',
    )
  }

  publish() {
    this.error()
  }

  subscribe(triggerName, onMessage) {
    this.error()
  }

  unsubscribe(subId) {
    this.error()
  }

  asyncIterator(triggers) {
    this.error()
  }
}

module.exports = PostgresPubSubNoop
