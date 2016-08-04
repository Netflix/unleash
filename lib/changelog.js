const
  colors = require('chalk'),
  log    = require('fancy-log')

/**
 * This outputs change information from git commits to CHANGELOG.md
 */
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
