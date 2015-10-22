const Assert             = require('assert-plus')
const unleashTaskManager = require('./index.js')

describe('The Unleash task manager', () => {
  it('Has a task function (well it inherits from Undertaker)', () => {
    Assert.func(unleashTaskManager.task)
  })
})
