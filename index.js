#!/usr/bin/env node

const
  Undertaker     = require('undertaker'),
  colors         = require('chalk'),
  log            = require('fancy-log'),
  git            = require('gulp-git'),
  values         = require('object-values'),
  vinylFS        = require('vinyl-fs'),
  writeChangelog = require('./lib/changelog'),
  Deploy         = require('./lib/deploy')

// Module-level CLI globals
var
  isTrial = false,
  versionType,
  repoType

const
  CHANGELOG_COMMIT   = 'changelog:commit',
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

taskManager.task(CHANGELOG_WRITE, function (done) {
  const nextVersion = Deploy.getNextVersion(versionType)
  log('Utilizing next version for changelog: ', colors.magenta(nextVersion))

  if (isTrial === true) {
    return done()
  } else {
    return writeChangelog({
      version  : nextVersion,
      repoType : repoType
    }, done)
  }
})

taskManager.task('changelog:commit', function () {
  if (isTrial) {
    return true
  } else {
    // TODO - allow configuration of this src?
    return vinylFS.src(['*.md'])
             .pipe(git.add())
             .pipe(git.commit('docs(CHANGELOG): Update changelog'))
  }
})

// bump:major, bump:minor, bump:patch
; versionTypes.forEach(function (bumpType) {
  const options        = { bumpType: bumpType },
        deployWithBump = Deploy.withBumpType.bind(Deploy, options),
        bumpTaskName   = bumperize(bumpType)

  function noTrial () {
    isTrial = false
    return deployWithBump({ dryRun : false })
  }

  taskManager.task(bumpTaskName, taskManager.series([
    CHANGELOG_WRITE,
    CHANGELOG_COMMIT,
    noTrial
  ]))
  taskManager.task(join(CHANGELOG_WRITE, bumpType), taskManager.series([CHANGELOG_WRITE]))

  function dryRun () {
    isTrial = true
    return deployWithBump({ dryRun: true })
  }

  return taskManager.task(join(bumpTaskName, DRY_RUN), taskManager.series([
    CHANGELOG_WRITE,
    CHANGELOG_COMMIT,
    dryRun
  ]))
})

if (!module.parent) {
  const unleash = shortVersionFlags.reduce(function (y, shortFlag) {
    return y.option(shortFlag, {
             alias:    VersionFlagMap[shortFlag],
             describe: 'Alias for --type=' + VersionFlagMap[shortFlag],
             type:     'boolean'
           })
  }, require('yargs'))
    .option('type', {
      describe: 'The SemVer version type such as "patch"',
      type:     'string'
    })
    .option('repoType', {
      alias: 'r',
      describe: 'The remote repository type such as "stash"',
      default:  'github',
      type:     'string'
    })
    .alias(DRY_RUN_SHORT_FLAG, DRY_RUN_LONG_FLAG)
    .help('h').alias('h', 'help')
    .argv

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

  if (unleash.type) {
    var taskName = bumperize(unleash.type)
    versionType = unleash.type
    repoType = unleash.repoType
    unleash.dryRun && (taskName = join(taskName, DRY_RUN))
    const task = taskManager.task(taskName)
    task()
  } else {
    throw new Error('Need a task homie')
  }
}

module.exports = taskManager
