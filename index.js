#!/usr/bin/env node

'use strict' // force block-scoping

/* Trick in-publish into thinking we're the NPM CLI running publish */
process.env.npm_config_argv = JSON.stringify({ cooked : [ 'publish' ] })

const
  ChildProcess   = require('child_process'),
  Undertaker     = require('undertaker'),
  colors         = require('chalk'),
  fancyLog       = require('fancy-log'),
  git            = require('gulp-git'),
  merge          = require('lodash.merge'),
  values         = require('object-values'),
  vinylFS        = require('vinyl-fs'),
  ghPages        = require('./lib/gh-pages'),
  writeChangelog = require('./lib/changelog'),
  Deploy         = require('./lib/deploy'),
  ls             = require('./lib/ls')

// Module-level CLI globals
let
  isDryRun = false,
  ghp

const
  CHANGELOG_COMMIT   = 'changelog:commit',
  GH_PAGES_DEPLOY    = 'ghpages:deploy',
  CHANGELOG_WRITE    = 'changelog:write',
  DRY_RUN_SHORT_FLAG = 'd',
  DRY_RUN            = 'dry-run',
  DRY_RUN_LONG_FLAG  = DRY_RUN

const VersionFlagMap = {
  m : 'minor',
  M : 'major',
  p : 'patch',
  P : 'prerelease'
}

function join (a, b) {
  return a + ':' + b
}

function bumperize (bumpType) {
  return join('bump', bumpType)
}

const shortVersionFlags = Object.keys(VersionFlagMap)
const longVersionFlags  = values(VersionFlagMap)
const versionTypes      = longVersionFlags
const taskManager       = new Undertaker

const REF_SHA_CMD    = 'git rev-parse --verify HEAD'
const CURRENT_SHA    = ChildProcess.execSync(REF_SHA_CMD)
                        .toString().replace('\n','')

const unleash = shortVersionFlags.reduce(function (y, shortFlag) {
  return y.option(shortFlag, {
    alias:    VersionFlagMap[shortFlag],
    describe: 'Alias for --type=' + VersionFlagMap[shortFlag],
    type:     'boolean'
  })
}, require('yargs'))
  .option('type', {
    describe: 'The SemVer version type such as "patch" that you want to publish to NPM with',
    type:     'string'
  })
  .option('ls', {
    alias:    'l',
    describe: 'Prints the files and directories that will and won\'t be published',
    type:     'boolean'
  })
  .option('repo-type', {
    alias:    'r',
    describe: 'The remote repository type such as "stash"',
    default:  'github',
    type:     'string'
  })
  .option('publish', {
    alias:    'pb',
    describe: 'Sets whether or not the package is published to NPM (negate with --no-publish)',
    default:  true,
    type:     'boolean'
  })
  .option('push', {
    alias:    'ps',
    describe: 'Sets whether or not the package is pushed to a git remote (negate with --no-push)',
    default:  true,
    type:     'boolean'
  })
  .option('ghpages-deploy', {
    alias:    'gh',
    describe: 'Deploy gh-pages',
    type:     'boolean'
  })
  .option('ghpages-path', {
    alias:    'ghp',
    describe: 'The glob path to deploy to gh-pages',
    default:  './docs/**/*',
    type:     'string'
  })
  .alias(DRY_RUN_SHORT_FLAG, DRY_RUN_LONG_FLAG)
  .alias('list-publishables', 'ls')
  .help('h').alias('h', 'help')
  .argv

unleash.CURRENT_SHA = CURRENT_SHA

const taskManagerInternalsSentinel = Symbol('__internals__')

const taskInternals = taskManager[taskManagerInternalsSentinel] = {
  log : fancyLog
}

taskManager.task(CHANGELOG_WRITE, function (done) {
  const nextVersion = Deploy.getNextVersion(versionType)
  
  if (isDryRun === true) {
    taskInternals.log(
      '* Creating a changelog entry for version ' + nextVersion + ' with links to the commits on ' + repoType
    )
    return done()
  } else {
    taskInternals.log('Utilizing next version for changelog: ', colors.magenta(nextVersion))
    return writeChangelog({
      version  : nextVersion,
      repoType : repoType
    }, done)
  }
})

taskManager.task('ls', function () {
  return ls()
})

taskManager.task(CHANGELOG_COMMIT, function (done) {
  const docsCommit = 'docs(CHANGELOG): Update changelog'

  if (isDryRun) {
    taskInternals.log('* Adding commit "' + docsCommit + '"')
    return done()
  } else {
    // TODO - allow configuration of this src?
    return vinylFS.src([ '*.md' ])
             .pipe(git.add())
             .pipe(git.commit(docsCommit))
  }
})

taskManager.task(GH_PAGES_DEPLOY, function (done) {
  if (isDryRun) {
    taskInternals.log('* Pushing a gh-pages branch from the contents of "' + ghp + '"')
    return done ? done() : true
  } else {
    taskInternals.log('Deploying to gh-pages from ' + ghp)
    return vinylFS.src([ ghp ])
             .pipe(ghPages())
  }
})

function dryRunStartGh (done) {
  taskInternals.log('Utilizing ' + colors.magenta('dry run mode') + '. This is a dry run of the following actions:')
  return done()
}

taskManager.task(join(GH_PAGES_DEPLOY, DRY_RUN), taskManager.series([
  dryRunStartGh,
  GH_PAGES_DEPLOY
]))

// bump:major, bump:minor, bump:patch
; versionTypes.forEach(function (bumpType) {
  const options    = { bumpType: bumpType },
    deployWithBump = Deploy.withBumpType.bind(Deploy, options),
    bumpTaskName   = bumperize(bumpType)

  function noTrial () {
    return deployWithBump(merge({ dryRun : false }, unleash))
  }

  taskManager.task(bumpTaskName, taskManager.series([
    CHANGELOG_WRITE,
    CHANGELOG_COMMIT,
    noTrial
  ]))
  taskManager.task(join(CHANGELOG_WRITE, bumpType), taskManager.series([ CHANGELOG_WRITE ]))

  function dryRun () {
    return deployWithBump(merge({ dryRun : true }, unleash))
  }

  function dryRunStart (done) {
    const nextVersion = Deploy.getNextVersion(versionType)
    taskInternals.log('Utilizing ' + colors.magenta('dry run mode') + '. This is a dry run of the following actions:')
    taskInternals.log('* Incrementing to the next "' + bumpType + '" semantic version, "' + nextVersion + '"')

    return done()
  }

  return taskManager.task(join(bumpTaskName, DRY_RUN), taskManager.series([
    dryRunStart,
    CHANGELOG_WRITE,
    CHANGELOG_COMMIT,
    dryRun
  ]))
})

isDryRun = !!unleash.dryRun
const versionType = unleash.type
const repoType = unleash.repoType

if (unleash.gh) {
  ghp = unleash.ghp 
}

// Kray Kray McFadden ish to fake mutually exclusive arguments
// See https://github.com/bcoe/yargs/issues/275
shortVersionFlags.forEach(function (key) {
  if (unleash[key]) {
    if (unleash.type) {
      throw new Error('You\'re confusing me! Please don\'t pass more than one version type flag')
    }

    unleash.type = VersionFlagMap[key]
  }
})

// Don't automatically run tasks based on argv unless we're run via a CLI
if (!module.parent) {
  taskInternals.log(colors.yellow('=== UNLEASH ==='))

  const command = process.argv.slice(1).map(function (a) {
    return a.split('/').reverse()[0]
  }).join(' ')
  const wut = 'What did you want me to dry run?'
  const noType = 'Need a semantic version type homie...' 
  const fakeBumpType = 'semantic-version-type-should-be-here'

  function logFlagCommand () {
    return taskInternals.log.error('Run "unleash --help" to discover available flags')
  }

  function logCorrectedCommand (flag) {
    return taskInternals.log.error(command + ' --' + colors.bgGreen(colors.white(flag)))
  }

  if (unleash.type) {
    if (unleash.ls)
      ls()

    if (unleash.gh) {
      const task = taskManager.task(GH_PAGES_DEPLOY)
      task()
    }

    let taskName = bumperize(unleash.type)

    if (isDryRun) 
      taskName = join(taskName, DRY_RUN)

    const task = taskManager.task(taskName)
    task()
  } else if (unleash.ls) {
    const task = taskManager.task('ls')
    task()
  } else if (unleash.gh) {
    ghp = unleash.ghp 
    const task = taskManager.task(isDryRun ? join(GH_PAGES_DEPLOY, DRY_RUN) : GH_PAGES_DEPLOY)
    task()
  } else if (!unleash.publish) {
    const errorMessage = colors.bgRed(colors.white(isDryRun ? wut : noType))

    taskInternals.log.error(errorMessage)
    logCorrectedCommand(fakeBumpType)
    logFlagCommand()
  } else if (!unleash.push) {
    const errorMessage = colors.bgRed(colors.white(isDryRun ? wut : noType))

    taskInternals.log.error(errorMessage)
    logCorrectedCommand(fakeBumpType)
    logFlagCommand()
  } else {
    const noTask = 'Need a task homie...' 
    const errorMessage = colors.bgRed(colors.white(isDryRun ? wut : noTask))

    taskInternals.log.error(errorMessage)
    logCorrectedCommand('flag-name-should-be-here')
    logFlagCommand()
  }
}

module.exports = taskManager
module.exports.taskManagerInternalsSentinel = taskManagerInternalsSentinel
