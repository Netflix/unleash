const spec               = require('tape')
const unleashTaskManager = require('../../index')


spec('The Unleash task manager', ({ test, end : endSpec }) => {
  test('Has a task function (well it inherits from Undertaker)', ({ equal, end : endTest }) => {
    equal(typeof unleashTaskManager.task, 'function')
    endTest()
  })

  test('Has an ls task', ({ equal, end : endTest }) => {
    equal(typeof unleashTaskManager.task('ls'), 'function')
    endTest()
  })

  endSpec()
})
