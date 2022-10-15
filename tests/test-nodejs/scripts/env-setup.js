const config = require('mocktomata').config

config({
  folder: '.mockto',
  target: 'es2015',
  plugins: []
})

config.spec({
  mode: 'live',
  fileNameMatch: /add.spec/,
  specNameMatch: /^1*/
})
