'use strict' // force block-scoping w/ Node < 6

const spec               = require('tape')
const unleashTaskManager = require('../../')

const SemVerIncrementTypes = [
  'major', 'minor', 'patch', 'prerelease'
]

const taskNames = Object.keys(unleashTaskManager._registry._tasks)

spec('The Unleash task manager', ({ test, end : endSpec }) => {
  test('Has a task function (well it inherits from Undertaker)', ({ equal, end : endTest }) => {
    equal(typeof unleashTaskManager.task, 'function')
    endTest()
  })

  test('Has the expected number of tasks', ({ equal, end : endTest }) => {
    equal(taskNames.length, 17)
    endTest()
  })

  test('Has the expected number of dry run tasks', ({ equal, end : endTest }) => {
    const dryRunTaskNames = taskNames.filter(n => n.includes('dry-run'))
    equal(dryRunTaskNames.length, 5)
    endTest()
  })

  test('Has changelog write tasks for each semver type', ({ equal, end : endTest }) => {
    const changelogWritePrefix = 'changelog:write:'
    const changelogWriteTaskNames = taskNames.filter(n => n.includes(changelogWritePrefix))
    equal(changelogWriteTaskNames.length, SemVerIncrementTypes.length)
    SemVerIncrementTypes.forEach(t => equal(changelogWriteTaskNames.includes(`${changelogWritePrefix}${t}`), true))
    endTest()
  })

  test('Has a ghpages dry run task', ({ equal, end : endTest }) => {
    equal(typeof unleashTaskManager._registry._tasks['ghpages:deploy:dry-run'], 'function')
    endTest()
  })

  test('Has an ls task', ({ equal, end : endTest }) => {
    equal(typeof unleashTaskManager.task('ls'), 'function')
    endTest()
  })

  endSpec()
})
