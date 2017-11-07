const spec = require('tape')

const relativePathToUnleashIndex = '../../'
const moduleIdentifierForUnleashIndex = require.resolve(relativePathToUnleashIndex)
delete require.cache[moduleIdentifierForUnleashIndex]

process.argv.push('--dry-run', '--ghpages-deploy', '-M')

const unleashTaskManager = require(relativePathToUnleashIndex)
const Deploy = require('../../lib/deploy')
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

const createDoneCallbackWrapper = () => {
  let callCount = 0
  const done = function () {
    return callCount++
  }

  return {
    execute : done,
    reset : () => callCount = 0,
    get callCount() {
      return callCount
    }
  }
}

spec('The dry run task set', ({ test, end : endSpec }) => {
  test('Has a changelog commit task that logs', ({ equal, end : endTest }) => {
    const changelogCommitTaskName = 'changelog:commit'
    const changelogCommitTask = tasks[changelogCommitTaskName]
    equal(typeof changelogCommitTask, 'function', 'Has a changelog commit dry run task')

    const resetTaskLoggerAndReturnLogMessage = taskLogSwapper()
    const doneCallbackWrapper = createDoneCallbackWrapper()

    changelogCommitTask(doneCallbackWrapper.execute)
    equal(resetTaskLoggerAndReturnLogMessage(), '* Adding commit "docs(CHANGELOG): Update changelog"', 'Logs that it\'d commit')
    equal(doneCallbackWrapper.callCount, 1, 'The "done" callback is invoked once')
    
    endTest()
  })

  test('Has a changelog write task that logs', ({ equal, end : endTest }) => {
    const changelogWriteTaskName = 'changelog:write'
    const changelogWriteTask = tasks[changelogWriteTaskName]
    equal(typeof changelogWriteTask, 'function', 'Has a changelog write dry run task')

    const resetTaskLoggerAndReturnLogMessage = taskLogSwapper()
    const doneCallbackWrapper = createDoneCallbackWrapper()

    changelogWriteTask(doneCallbackWrapper.execute)

    equal(resetTaskLoggerAndReturnLogMessage(), `* Creating a changelog entry for version ${Deploy.getNextVersion('major')} with links to the commits on github`, 'Logs that it\'d write')
    equal(doneCallbackWrapper.callCount, 1, 'The "done" callback is invoked once')
    
    endTest()
  })

  test('Has a ghpages task that logs', ({ equal, end : endTest }) => {
    const ghpagesTaskName = 'ghpages:deploy'
    const ghpagesTask = tasks[ghpagesTaskName]
    equal(typeof ghpagesTask, 'function', 'Has a ghpages dry run task')

    const resetTaskLoggerAndReturnLogMessage = taskLogSwapper()
    const doneCallbackWrapper = createDoneCallbackWrapper()

    ghpagesTask(doneCallbackWrapper.execute)
    equal(resetTaskLoggerAndReturnLogMessage(), '* Pushing a gh-pages branch from the contents of "./docs/**/*"', 'Logs that it\'d push a gh-pages branch')
    equal(doneCallbackWrapper.callCount, 1, 'The "done" callback is invoked once')
    
    endTest()
  })

  test('Has a ghpages task that returns true sans done callback', ({ equal, end : endTest }) => {
    const ghpagesTaskName = 'ghpages:deploy'
    const ghpagesTask = tasks[ghpagesTaskName]
    const resetTaskLogger = taskLogSwapper()

    equal(ghpagesTask(), true, 'Returns true')

    resetTaskLogger()    
    endTest()
  })

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
