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
      dryRun = options.dryRun

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

    let fileStream = vinylFS.src([ './package.json' ])

    if (!dryRun) {
      let tagVersionConfig

      if (isLernaPackage()) {
        const pkgName = paqman.packageJSON.name
        tagVersionConfig = {
          prefix : pkgName + '_v',
          label  : 'Tagging ' + pkgName + ' release as %t'
        }
        log('Tagging ' + pkgName + ' as a package in a Lerna repo')
      }

      fileStream = fileStream
        .pipe(bump({ type: bumpType }))
        .pipe(vinylFS.dest('./'))
        .pipe(git.commit('chore(release): release ' + NEXT_VERSION))
        .pipe(filter('package.json'))
        .pipe(tagVersion(tagVersionConfig))
    }

    return fileStream.pipe(streamDone(function () {
      const
        args   = ' --tags',
        remote = 'origin'

      if (dryRun) {
        return log('This is a dry run. We\'d be running git push ' +
                              remote + ' ' + CURRENT_BRANCH + args)
      }

      return git.push(remote, CURRENT_BRANCH, { args: args }, function (error) {
        if (error) {
          throw error
        }

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
      })
    }))
  }
})
