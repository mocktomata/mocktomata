const logging = require('@unional/logging')
const ColorAppender = require('aurelia-logging-color').ColorAppender

logging.addAppender(new ColorAppender())
logging.setLevel(logging.logLevel.debug)
