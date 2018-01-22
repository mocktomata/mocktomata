import WebSocket = require('ws')

import { SpecPluginUtil, SpecContext } from '../index'
import { spyWebSocketClient } from './spyWebSocketClient'
import { stubWebSocketClient } from './stubWebSocketClient'

let komondorUtil: SpecPluginUtil

export function activate(util: SpecPluginUtil) {
  komondorUtil = util
}

export function getSpy(context: SpecContext, subject: any) {
  if (!isWebSocketClient(subject)) return undefined
  return spyWebSocketClient(context, subject)
}

export function getStub(context: SpecContext, subject: any, id: string) {
  if (!isWebSocketClient(subject)) return undefined

  const action = context.peek()
  if (!action || !action.type.startsWith('ws/')) return undefined

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

