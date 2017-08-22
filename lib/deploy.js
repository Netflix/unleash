const
  colors  = require('chalk'),
  log     = require('fancy-log'),
  paqman  = require('paqman'),
  vinylFS = require('vinyl-fs')

function getNextVersion (type) {
  const SemVer = require('semver')
  const currentVersion = paqman.packageJSON.version
  log('Getting next version of type: ', colors.magenta(type))
  log('Incrementing from version: ', colors.magenta(currentVersion))
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
      noPublish = options.noPublish,
      noPush = options.noPush

    log('Utilizing bumpType',  colors.magenta(options.bumpType))

    function streamDone (finalOperation) {
      const stream = new Stream.Transform({ objectMode: true })

      stream._transform = function (file, unused, callback) {
        finalOperation()
        callback(null, file)
      }

      return stream
    }

    log('Retrieving latest git commit...')

    const
      REF_HEAD_CMD   = 'git rev-parse --abbrev-ref HEAD',
      CURRENT_BRANCH = ChildProcess.execSync(REF_HEAD_CMD)
                         .toString().replace('\n',''),
      NEXT_VERSION   = getNextVersion(bumpType)

    const fileStream = vinylFS.src([ './package.json' ])

    const
      args   = ' --tags',
      remote = 'origin',
      releaseCommitMsg = 'chore(release): release ' + NEXT_VERSION

    function publish () {
      log('Loading NPM....')
      
      const NPM = require('npm')
      NPM.load(function () { // must be called first
        NPM.publish(function (pubError) {
          if (pubError) {
            log.error('Publish failed, your changelog may get in an undefined state :(')
            log.error(pubError)
            throw pubError
          }
        })
      })
    }

    function push () {
      return git.push(remote, CURRENT_BRANCH, { args: args }, function (error) {
        if (error)
          throw error

        if (!noPublish)
          publish()
      })
    }

    const wouldPublish = noPush && !noPublish
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

    if (!dryRun) {
      if (isLPkg)
        log('Tagging ' + pkgName + ' as a package in a Lerna repo')

      return fileStream
        .pipe(bump({ type: bumpType }))
        .pipe(vinylFS.dest('./'))
        .pipe(git.commit(releaseCommitMsg))
        .pipe(filter('package.json'))
        .pipe(tagVersion(tagVersionConfig))
        .pipe(streamDone(function () {
          if (wouldPublish)
            publish()
          else if (wouldPush)
            push()
        }))
    } else {
      const pubLog = wouldPublish ? '* Publishing to NPM \n' : ''
      const pushLog = wouldPush ? '* Pushing to ' + remote + ' branch ' + CURRENT_BRANCH + ' \n' : ''
      
      return log('' +
        '* Bumping to a ' + bumpType + ' version with the commit ' + releaseCommitMsg + ' \n' +
        '* Tagging the commit with ' + (tagVersionConfig ? tagVersionConfig.prefix + NEXT_VERSION : NEXT_VERSION) + ' \n' +
        pubLog + pushLog 
      )
    }
  }
})
