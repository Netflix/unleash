const spec = require('tape')

const relativePathToUnleashIndex = '../../'
const moduleIdentifierForUnleashIndex = require.resolve(relativePathToUnleashIndex)
delete require.cache[moduleIdentifierForUnleashIndex]

process.argv.push('--dry-run')

const unleashTaskManager = require(relativePathToUnleashIndex)
const tasks = unleashTaskManager._registry._tasks

spec('The dry run task set', ({ test, end : endSpec }) => {
  test('Has a changelog commit task that logs', ({ equal, end : endTest }) => {
    const changelogCommitTaskName = 'changelog:commit'
    const changelogCommitTask = tasks[changelogCommitTaskName]
    equal(typeof changelogCommitTask, 'function', 'Has a changelog commit dry run task')

    const _log = unleashTaskManager[unleashTaskManager.taskManagerInternalsSentinel].log
    let logMessage
    unleashTaskManager[unleashTaskManager.taskManagerInternalsSentinel].log = m => logMessage = m

    changelogCommitTask()
    equal(logMessage, '* Adding commit ""', 'Logs that it\'d commit')

    unleashTaskManager[unleashTaskManager.taskManagerInternalsSentinel].log = _log
    
    endTest()
  })

  endSpec()
})
