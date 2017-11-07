'use strict' // force block-scoping w/ Node < 6

const spec               = require('tape')
const unleashTaskManager = require('../../')

const SemVerIncrementTypes = [
  'major', 'minor', 'patch', 'prerelease'
]

const taskNames = Object.keys(unleashTaskManager._registry._tasks)

spec('The Unleash task manager', specOptions => {
  const test = specOptions.test
  const endSpec = specOptions.end

  test('Has a task function (well it inherits from Undertaker)', ({ equal, end : endTest }) => {
    equal(typeof unleashTaskManager.task, 'function')
    endTest()
  })

  test('Has the expected number of tasks', testOptions => {
    const equal = testOptions.equal
    const endTest = testOptions.end

    equal(taskNames.length, 17)
    endTest()
  })

  test('Has the expected number of dry run tasks', testOptions => {
    const equal = testOptions.equal
    const endTest = testOptions.end

    const dryRunTaskNames = taskNames.filter(n => n.includes('dry-run'))
    equal(dryRunTaskNames.length, 5)
    endTest()
  })

  test('Has changelog write tasks for each semver type', testOptions => {
    const equal = testOptions.equal
    const endTest = testOptions.end

    const changelogWritePrefix = 'changelog:write:'
    const changelogWriteTaskNames = taskNames.filter(n => n.includes(changelogWritePrefix))
    equal(changelogWriteTaskNames.length, SemVerIncrementTypes.length)
    SemVerIncrementTypes.forEach(t => equal(changelogWriteTaskNames.includes(`${changelogWritePrefix}${t}`), true))
    endTest()
  })

  test('Has a ghpages dry run task', testOptions => {
    const equal = testOptions.equal
    const endTest = testOptions.end

    equal(typeof unleashTaskManager._registry._tasks['ghpages:deploy:dry-run'], 'function')
    endTest()
  })

  test('Has an ls task', testOptions => {
    const equal = testOptions.equal
    const endTest = testOptions.end

    equal(typeof unleashTaskManager.task('ls'), 'function')
    endTest()
  })

  endSpec()
})
