const path = require('path')

const env = process.env
const cookedRunScriptArgs = JSON.parse(env.npm_config_argv).cooked
const hasSingle = env.npm_lifecycle_event = 'test:single' && cookedRunScriptArgs[cookedRunScriptArgs.length-2] === '--path'
const testPath = cookedRunScriptArgs[cookedRunScriptArgs.length-1]

hasSingle && testPath &&
  require(`${path.join(process.cwd(), testPath)}`)
