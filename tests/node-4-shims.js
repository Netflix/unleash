'use strict' // force block-scoping w/ Node < 6

module.exports.includes = function (subString) {
  return this.indexOf(subString) !== -1
}
