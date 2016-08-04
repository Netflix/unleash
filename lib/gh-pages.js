// Based on https://github.com/shinnn/gulp-gh-pages/blob/master/index.js
const Transform = require('readable-stream/transform')
const log = require('fancy-log')
const vinylFs = require('vinyl-fs')
const wrapPromise = require('wrap-promise')
const git = require('./git')

/*
 * Public: Push to gh-pages branch for github
 *
 * options - {Object} that contains all the options of the plugin
 *   - remoteUrl: The {String} remote url (github repository) of the project,
 *   - origin: The {String} origin of the git repository (default to `"origin"`),
 *   - branch: The {String} branch where deploy will by done (default to `"gh-pages"`),
 *   - cacheDir: {String} where the git repo will be located. (default to a temporary folder)
 *   - push: {Boolean} to know whether or not the branch should be pushed (default to `true`)
 *   - message: {String} commit message (default to `"Update [timestamp]"`)
 *
 * Returns `Stream`.
**/
module.exports = function gulpGhPages(options) {
  options = options || {}
  const origin = options.origin || 'origin'
  const branch = options.branch || 'gh-pages'
  const message = options.message || 'Update ' + new Date().toISOString()

  const files = []
  let TAG

  if (branch !== 'gh-pages') {
    TAG = '[gh-pages (' + branch + ')]'
  } else {
    TAG = '[gh-pages]'
  }

  const stream = new Transform({
    objectMode: true,
    transform: function transform(file, enc, cb) {
      if (file.isNull()) {
        cb(null, file)
        return
      }

      if (file.isStream()) {
        cb(new Error('Stream content is not supported'))
        return
      }

      files.push(file)
      cb(null, file)
    },

    flush: function flush(cb) {
      if (files.length === 0) {
        log(TAG, 'No files in the stream.')
        cb()
        return
      }

      let newBranchCreated = false

      git.prepareRepo(options.remoteUrl, origin, options.cacheDir || '.publish')
      .then(function (repo) {
        log(TAG, 'Cloning repo')
        if (repo._localBranches.indexOf(branch) > -1) {
          log(TAG, 'Checkout branch `' + branch + '`')
          return repo.checkoutBranch(branch)
        }

        if (repo._remoteBranches.indexOf(origin + '/' + branch) > -1) {
          log(TAG, 'Checkout remote branch `' + branch + '`')
          return repo.checkoutBranch(branch)
        }

        log(TAG, 'Create branch `' + branch + '` and checkout')
        newBranchCreated = true
        return repo.createAndCheckoutBranch(branch)
      })
      .then(function (repo) {
        return wrapPromise(function (resolve, reject) {
          if (newBranchCreated) {
            resolve(repo)
            return
          }

          // updating to avoid having local cache not up to date
          log(TAG, 'Updating repository')
          repo._repo.git('pull', function (err) {
            if (err) {
              reject(err)
              return
            }

            resolve(repo)
          })
        })
      })
      .then(function (repo) {
        // remove all files
        return wrapPromise(function (resolve, reject) {
          repo._repo.remove('.', { r: true }, function (err) {
            if (err) {
              reject(err)
              return
            }

            resolve(repo.status())
          })
        })
      })
      .then(function (repo) {
        log(TAG, 'Copying files to repository')

        return wrapPromise(function (resolve, reject) {
          const destStream = vinylFs.dest(repo._repo.path)
          .on('error', reject)
          .on('end', function () {
            resolve(repo)
          })
          .resume()

          files.forEach(function (file) {
            destStream.write(file)
          })

          destStream.end()
        })
      })
      .then(function (repo) {
        return repo.addFiles('.', { force: options.force || false })
      })
      .then(function (repo) {
        const filesToBeCommitted = Object.keys(repo._staged).length

        if (filesToBeCommitted === 0) {
          log(TAG, 'No files have changed.')
          cb()
          return
        }

        log(TAG, 'Adding ' + filesToBeCommitted + ' files.')
        log(TAG, 'Committing "' + message + '"')
        repo.commit(message).then(function (newRepo) {
          if (options.push === undefined || options.push) {
            log(TAG, 'Pushing to remote.')
            newRepo._repo.git('push', {
              'set-upstream': true
            }, [ origin, newRepo._currentBranch ], function (err) {
              if (err) {
                cb(err)
                return
              }

              cb()
            })

            return
          }

          cb()
        }, cb)
      })
      .catch(function (err) {
        setImmediate(function () {
          cb(err)
        })
      })
    }
  })

  stream.on('error', console.error.bind(console))
  /*
      All Readable streams begin in paused mode but can be switched to flowing mode in one of the following ways:

		  * Adding a 'data' event handler.
		  * Calling the stream.resume() method.
		  * Calling the stream.pipe() method to send the data to a Writable.
   */

  stream.resume()

  return stream
}
