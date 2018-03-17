import { addAppender, setLevel, logLevel } from '@unional/logging'
import { ColorAppender } from 'aurelia-logging-color'
import bodyParser from 'body-parser'
import express from 'express'
import logger from 'morgan'

import api from './setup'

export function createApp(port) {
  addAppender(new ColorAppender())
  setLevel(logLevel.debug)

  const router: express.Router = express.Router()
  const app: express.Express = express()
  app
    .use(logger('dev'))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }))

  api.setup(app, router)

  app.use('/', router)
  app.set('port', port)
  return app
}

