import WebSocket = require('ws')
import { SpecPluginUtil, SpecContext, KomondorRegistrar } from '../interfaces'

import { spyWebSocketClient } from './spyWebSocketClient'
import { stubWebSocketClient } from './stubWebSocketClient'

let komondorUtil: SpecPluginUtil

export function activate(registrar: KomondorRegistrar, komondor: SpecPluginUtil) {
  komondorUtil = komondor
  registrar.registerGetSpy(getSpy)
  registrar.registerGetStub(getStub)
}

function getSpy(context: SpecContext, subject: any) {
  if (!isWebSocketClient(subject)) return undefined
  return spyWebSocketClient(context, subject)
}

function getStub(context: SpecContext, subject: any, id: string) {
  if (!isWebSocketClient(subject)) return undefined
  return stubWebSocketClient(context, komondorUtil, subject, id)
}

function isWebSocketClient(subject): subject is typeof WebSocket {
  return subject.name === 'WebSocket' &&
    subject.CONNECTING === 0 &&
    subject.OPEN === 1 &&
    subject.CLOSING === 2 &&
    subject.CLOSED === 3 &&
    subject.Server && subject.Server.name === 'WebSocketServer' &&
    subject.Receiver && subject.Receiver.name === 'Receiver' &&
    subject.Sender && subject.Sender.name === 'Sender'
}

