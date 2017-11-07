const
  colors = require('chalk'),
  log    = require('fancy-log')

/**
 * changelog module.
 * @module lib/changelog
 */

/**
 * Output change information from git commits to CHANGELOG.md
 *
 * @param options - {Object} that contains all the options of the changelog writer
 *   - repoType: The {String} repo type (github or stash) of the project (default to `"github"`),
 *   - version: The {String} semantic version to add a change log for
 * @param done - {Function} that gets called when the changelog write task has completed
 *
 * @return `Function`.
**/
function writeChangelog (options, done) {
  options.repoType = options.repoType || 'github'

  log('Using repo type: ', colors.magenta(options.repoType))

  const pkg = require(process.cwd() + '/package')

  const opts = {
    log: log,
    repository: pkg.repository.url,
    version: options.version
  }

  // Github uses "commit", Stash uses "commits"
  if (options.repoType === 'stash') {
    const template = require('lodash.template')
    const partial  = require('lodash.partial')

    const commitTemplate = function (repository, commit) {
      // TODO - Make this configurable and default to Github, but include a Stash option
      const templateFn = repository ?
        template('[<%= commit %>](<%= repository %>/commits/<%= commit %>)') :
        template('<%= commit %>')
      return templateFn({
        repository: repository,
        commit: commit.substring(0,8) // no need to show super long hash in log
      })
    }

    opts.commitLink = partial(commitTemplate, pkg.repository.url)
  }

  return require('nf-conventional-changelog')(opts, function (err, clog) {
    if (err) {
      throw new Error(err)
    } else {
      require('fs').writeFileSync(process.cwd() + '/CHANGELOG.md', clog)
      return done && typeof done === 'function' && done()
    }
  })
}

module.exports = writeChangelog
