function ls (onEnd) {
  const FN      = require('fstream-npm')
  const color   = require('chalk')
  const glob    = require('glob')
  const exclude = require('lodash.difference')

  const included = [ ]

  const all = glob.sync('**/**', { ignore : [ 'node_modules/**/**' ], nodir : true })

  FN({ path: process.cwd() })
    .on('child', function (e) {
      included.push(e._path.replace(e.root.path + '/', ''))
    })
    .on('end', function () {
      const excluded = exclude(all, included)

      console.info(color.magenta('\n\nWILL BE PUBLISHED\n'))
      console.info(color.green(included.join('\n')))
      console.info(color.magenta('\n\nWON\'T BE PUBLISHED\n'))
      console.info(color.red(excluded.join('\n')))

      if (typeof onEnd === 'function') {
        onEnd({
          included : included,
          excluded : excluded
        })
      }
    })
}

module.exports = ls

if (!module.parent) {
  ls()
}
