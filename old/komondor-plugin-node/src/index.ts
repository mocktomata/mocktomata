import { Registrar } from 'komondor-plugin'

import { activate as activateBuffer } from './Buffer'

import {
  activate as cpActivate,
  childProcessConstructed,
  childProcessInvoked,
  childProcessReturned
} from './childProcess'

import { activate as fsActivate } from './fs'

import {
  activate as streamActivate,
  streamConstructed,
  streamMethodInvoked,
  streamMethodReturned,
  streamReceivedMultipleData
} from './stream'

export {
  childProcessConstructed,
  childProcessInvoked,
  childProcessReturned,
  streamConstructed,
  streamMethodInvoked,
  streamMethodReturned,
  streamReceivedMultipleData
}

export function activate(registrar: Registrar) {
  activateBuffer(registrar)
  cpActivate(registrar)
  fsActivate(registrar)
  streamActivate(registrar)
}
