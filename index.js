#!/usr/bin/env node

'use strict' // force block-scoping

/* Trick in-publish into thinking we're the NPM CLI running publish */
process.env.npm_config_argv = JSON.stringify({ cooked : [ 'publish' ] })

const
  Undertaker     = require('undertaker'),
  colors         = require('chalk'),
  log            = require('fancy-log'),
  git            = require('gulp-git'),
  values         = require('object-values'),
  vinylFS        = require('vinyl-fs'),
  ghPages        = require('./lib/gh-pages'),
  writeChangelog = require('./lib/changelog'),
  Deploy         = require('./lib/deploy'),
  ls             = require('./lib/ls')

// Module-level CLI globals
let
  isDryRun = false,
  versionType,
  repoType

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

taskManager.task(CHANGELOG_WRITE, function (done) {
  const nextVersion = Deploy.getNextVersion(versionType)
  log('Utilizing next version for changelog: ', colors.magenta(nextVersion))

  if (isDryRun === true) {
    return done()
  } else {
    return writeChangelog({
      version  : nextVersion,
      repoType : repoType
    }, done)
  }
})

taskManager.task('ls', function () {
  return ls()
})

taskManager.task(CHANGELOG_COMMIT, function () {
  if (isDryRun) {
    return true
  } else {
    // TODO - allow configuration of this src?
    return vinylFS.src([ '*.md' ])
             .pipe(git.add())
             .pipe(git.commit('docs(CHANGELOG): Update changelog'))
  }
})

taskManager.task(GH_PAGES_DEPLOY, function (options) {
  log('Deploying to gh-pages from ' + options.path)

  if (isDryRun) {
    return true
  } else {
    return vinylFS.src([ options.path ])
             .pipe(ghPages())
  }
})

// bump:major, bump:minor, bump:patch
; versionTypes.forEach(function (bumpType) {
  const options    = { bumpType: bumpType },
    deployWithBump = Deploy.withBumpType.bind(Deploy, options),
    bumpTaskName   = bumperize(bumpType)

  function noTrial () {
    return deployWithBump({ dryRun : false })
  }

  taskManager.task(bumpTaskName, taskManager.series([
    CHANGELOG_WRITE,
    CHANGELOG_COMMIT,
    noTrial
  ]))
  taskManager.task(join(CHANGELOG_WRITE, bumpType), taskManager.series([ CHANGELOG_WRITE ]))

  function dryRun () {
    return deployWithBump({ dryRun: true })
  }

  return taskManager.task(join(bumpTaskName, DRY_RUN), taskManager.series([
    CHANGELOG_WRITE,
    CHANGELOG_COMMIT,
    dryRun
  ]))
})

if (!module.parent) {
  log(colors.yellow('=== UNLEASH ==='))

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
    if (unleash.ls) {
      ls()
    }

    if (unleash.gh) {
      const task = taskManager.task(GH_PAGES_DEPLOY)
      task({ path : unleash.ghp })
    }

    let taskName = bumperize(unleash.type)
    versionType = unleash.type
    repoType = unleash.repoType

    if (unleash.dryRun) {
      isDryRun = true
      taskName = join(taskName, DRY_RUN)
      log('Utilizing dry run mode')
    }

    const task = taskManager.task(taskName)
    task()
  } else if (unleash.ls) {
    const task = taskManager.task('ls')
    task()
  } else if (unleash.gh) {
    const task = taskManager.task(GH_PAGES_DEPLOY)
    task({ path : unleash.ghp })
  } else {
    throw new Error('Need a task homie')
  }
}

module.exports = taskManager
