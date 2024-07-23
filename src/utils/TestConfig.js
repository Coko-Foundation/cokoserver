class TestConfig {
  constructor(configObject) {
    this.config = configObject
  }

  get(key) {
    return this.config[key]
  }

  has(key) {
    return Object.prototype.hasOwnProperty.call(this.config, key)
  }
}

module.exports = TestConfig
