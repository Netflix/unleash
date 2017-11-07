const spec = require('tape')

const relativePathToUnleashIndex = '../../'
const moduleIdentifierForUnleashIndex = require.resolve(relativePathToUnleashIndex)
delete require.cache[moduleIdentifierForUnleashIndex]

process.argv.push('--dry-run', '--ghpages-deploy', '-M')

const unleashTaskManager = require(relativePathToUnleashIndex)
const tasks = unleashTaskManager._registry._tasks

const taskLogSwapper = () => {
  const _log = unleashTaskManager[unleashTaskManager.taskManagerInternalsSentinel].log
  let logMessage
  unleashTaskManager[unleashTaskManager.taskManagerInternalsSentinel].log = m => logMessage = logMessage ? `${logMessage}\n${m}` : m

  return () => {
    unleashTaskManager[unleashTaskManager.taskManagerInternalsSentinel].log = _log
    return logMessage
  }
}

spec('The bump dry run task set', ({ test, end : endSpec }) => {
  test('Has a major bump task that logs', ({ equal, end : endTest }) => {
    const bumpMajorTaskName = 'bump:major:dry-run'
    const bumpMajorTask = tasks[bumpMajorTaskName]
    
    equal(typeof bumpMajorTask, 'function', 'Has a major bump dry run task')

    const resetTaskLoggerAndReturnLogMessage = taskLogSwapper()

    bumpMajorTask()

    setTimeout(() => {
      equal(resetTaskLoggerAndReturnLogMessage().includes('Incrementing to the next "major" semantic version'), true)
      endTest()
    }, 200)
  })

  endSpec()
})
