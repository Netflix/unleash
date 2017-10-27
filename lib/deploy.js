const
  colors  = require('chalk'),
  log     = require('fancy-log'),
  paqman  = require('paqman'),
  vinylFS = require('vinyl-fs')

const currentVersion = paqman.packageJSON.version

function getNextVersion (type) {
  const SemVer = require('semver')
  return SemVer.inc(currentVersion, type)
}

function isLernaPackage () {
  const Path = require('path')

  const inPackageFolder = Path.dirname(process.cwd()).match(/packages$/)
  if (!inPackageFolder)
    return false

  const FS = require('fs')
  const inLernaRepo = FS.readdirSync('../../').indexOf('lerna.json') !== -1

  return inLernaRepo
}

module.exports = Object.create({
  getNextVersion: getNextVersion,

  withBumpType: function (options0, options1) {
    const
      Stream         = require('stream'),
      ChildProcess   = require('child_process'),
      merge          = require('lodash.merge'),
      bump           = require('gulp-bump'),
      filter         = require('gulp-filter'),
      git            = require('gulp-git'),
      tagVersion     = require('gulp-tag-version')

    // Allow options merge through arguments list.
    // This is useful for bind magic
    const options  = merge({ }, options0, options1),
      bumpType = options.bumpType,
      dryRun = options.dryRun,
      noPublish = !options.publish,
      noPush = !options.push

    function streamDone (finalOperation) {
      const stream = new Stream.Transform({ objectMode: true })

      stream._transform = function (file, unused, callback) {
        finalOperation()
        callback(null, file)
      }

      return stream
    }

    const
      REF_HEAD_CMD   = 'git rev-parse --abbrev-ref HEAD',
      CURRENT_BRANCH = ChildProcess.execSync(REF_HEAD_CMD)
                         .toString().replace('\n',''),
      NEXT_VERSION   = getNextVersion(bumpType)

    if (!dryRun) {
      log('Utilizing bumpType',  colors.magenta(options.bumpType))
      log('Retrieving latest git commit...')
      log('Getting next version of type: ', colors.magenta(bumpType))
      log('Incrementing from version: ', colors.magenta(currentVersion))
    }

    const fileStream = vinylFS.src([ './package.json' ])

    const
      args   = ' --tags',
      remote = 'origin',
      releaseCommitMsg = 'chore(release): release ' + NEXT_VERSION

    const wouldPublish = !noPublish
    const wouldPublishButNotPush = noPush && wouldPublish
    const wouldPush = !noPush
    let tagVersionConfig, pkgName
    const isLPkg = isLernaPackage()

    if (isLPkg) {
      pkgName = paqman.packageJSON.name
      tagVersionConfig = {
        prefix : pkgName + '_v',
        label  : 'Tagging ' + pkgName + ' release as %t'
      }
    }

    const tagPrefix = tagVersionConfig ? tagVersionConfig.prefix : 'v'

    function publish () {
      log('Loading NPM....')
      
      const NPM = require('npm')
      NPM.load(function () { // must be called first
        NPM.publish(function (pubError) {
          if (pubError) {
            revert()
            throw pubError
          }
        })
      })
    }

    function revert () {
      log(colors.bgRed(colors.black('~~~ ERROR ~~~')))
      log('`git push` failed, reverting your unchanged files to their')
      log(`state prior to running Unleash (${options.CURRENT_SHA})`)
      ChildProcess.execSync(`git tag -d ${tagPrefix + NEXT_VERSION}`)
      if (options.PKG_STATUS === '')
        ChildProcess.execSync(`git checkout ${options.CURRENT_SHA} package.json`)
      if (options.CL_STATUS === '')
        ChildProcess.execSync(`git checkout ${options.CURRENT_SHA} CHANGELOG.md`)
      ChildProcess.execSync(`git reset --mixed ${options.CURRENT_SHA}`)
    }

    function pushAndMaybePublish () {
      return git.push(remote, CURRENT_BRANCH, { args: args }, function (error) {
        if (error) {
          revert()
          throw error
        }

        if (!noPublish)
          publish()
      })
    }

    function warnLocalOnly () {
      if (!options.publish && !options.push) {
        const command = process.argv.slice(1).map(function (a) {
          return a.split('/').reverse()[0]
        }).join(' ')

        log(colors.bgYellow(colors.black('~~~ WARNING ~~~')))
        log('You\'ve turned both publishing & pushing off. Your ' + 
          'changelog & package files will be updated + committed locally but ' +
          'nothing outside your machine will change.')
        log(command
          .replace('publish', 
            colors.bgYellow('publish'))
          .replace('push', 
            colors.bgYellow('push'))
        )
      }
    }

    if (isLPkg)
      log('Tagging ' + pkgName + ' as a package in a Lerna repo')

    if (!dryRun) {
      warnLocalOnly()

      return fileStream
        .pipe(bump({ type: bumpType }))
        .pipe(vinylFS.dest('./'))
        .pipe(git.commit(releaseCommitMsg))
        .pipe(filter('package.json'))
        .pipe(tagVersion(tagVersionConfig))
        .pipe(streamDone(function () {
          if (wouldPublishButNotPush)
            publish()
          else if (wouldPush)
            pushAndMaybePublish()
        }))
    } else {
      const pubLog = wouldPublish ? '* Publishing to NPM' : ''
      const pushLog = wouldPush ? '* Pushing to ' + remote + ' branch ' + CURRENT_BRANCH : ''
      
      log('* Bumping to a ' + bumpType + ' version with the commit "' + releaseCommitMsg + '"')
      log('* Tagging the commit with "' + tagPrefix + NEXT_VERSION + '"')
      pubLog && log(pubLog)
      pushLog && log(pushLog)

      warnLocalOnly()

      return true
    }
  }
})
