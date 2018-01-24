import { AssertOrder } from 'assertron'
import { test } from 'ava'
import WebSocket = require('ws')

import { spec } from '../index'

test('ws verify', async t => {
  const wsSpec = await spec(WebSocket)
  const ws = new wsSpec.subject('ws://html5rocks.websocket.org/echo')

  const actionCount = new AssertOrder()
  wsSpec.onAny(() => { actionCount.exactly(1, 6) })

  ws.on('open', () => { ws.send('Ping') })

  const order = new AssertOrder(2)
  ws.on('message', (data) => {
    t.is(data, 'Ping')
    order.once(1)
    ws.terminate()
  })

  ws.on('close', () => { order.once(2) })

  await wsSpec.satisfy([
    { type: 'ws/constructor', payload: ['ws://html5rocks.websocket.org/echo'] },
    { type: 'ws/event', meta: { event: 'open' } },
    { type: 'ws/send', payload: 'Ping' },
    { type: 'ws/message', payload: 'Ping' },
    { type: 'ws/terminate' },
    { type: 'ws/event', meta: { event: 'close' } }
  ])
  order.end()
  actionCount.end()
})

test('ws save', async t => {
  const wsSpec = await spec(WebSocket, { id: 'ws/echo/success', mode: 'save' })
  const ws = new wsSpec.subject('ws://html5rocks.websocket.org/echo')


  const actionCount = new AssertOrder()
  wsSpec.onAny(() => { actionCount.exactly(1, 6) })

  ws.on('open', () => { ws.send('Ping') })

  const order = new AssertOrder(2)
  ws.on('message', (data) => {
    t.is(data, 'Ping')
    order.once(1)
    ws.terminate()
  })

  ws.on('close', () => { order.once(2) })

  await wsSpec.satisfy([
    { type: 'ws/constructor', payload: ['ws://html5rocks.websocket.org/echo'] },
    { type: 'ws/event', meta: { event: 'open' } },
    { type: 'ws/send', payload: 'Ping' },
    { type: 'ws/message', payload: 'Ping' },
    { type: 'ws/terminate' },
    { type: 'ws/event', meta: { event: 'close' } }
  ])
  order.end()
  actionCount.end()
})


test('ws replay', async t => {
  const wsSpec = await spec(WebSocket, { id: 'ws/echo/success', mode: 'replay' })
  const ws = new wsSpec.subject('ws://html5rocks.websocket.org/echo')


  const actionCount = new AssertOrder()
  wsSpec.onAny(() => { actionCount.exactly(1, 6) })

  ws.on('open', () => { ws.send('Ping') })

  const order = new AssertOrder(2)
  ws.on('message', (data) => {
    t.is(data, 'Ping')
    order.once(1)
    ws.terminate()
  })

  ws.on('close', () => { order.once(2) })

  await wsSpec.satisfy([
    { type: 'ws/constructor', payload: ['ws://html5rocks.websocket.org/echo'] },
    { type: 'ws/event', meta: { event: 'open' } },
    { type: 'ws/send', payload: 'Ping' },
    { type: 'ws/message', payload: 'Ping' },
    { type: 'ws/terminate' },
    { type: 'ws/event', meta: { event: 'close' } }
  ])
  order.end()
  actionCount.end()
})
