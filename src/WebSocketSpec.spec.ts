import { test } from 'ava'
import WebSocket = require('ws')
import { SpecOptions } from './index';

export function specWebSocket(WebSocketClass: WebSocket, _options?: SpecOptions) {
  return {
    subject: WebSocketClass
  }
}

test('actively closing web socket', () => {
  return new Promise(a => {
    const webSocketSpec = specWebSocket(WebSocket)

    const ws = new webSocketSpec.subject('ws://html5rocks.websocket.org/echo')

    // Log messages from the server
    ws.on('message', data => {
      console.log('Server: ', data)
      ws.terminate()
    })

    ws.on('close', () => {
      console.log('closing connection')
      a();
    })
    ws.on('open', () => {
      ws.send('Pinasdfg')
    })
  })
})
