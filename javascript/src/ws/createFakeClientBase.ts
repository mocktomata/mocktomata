import WebSocket = require('ws')
import { ClientOptions } from 'ws'

// istanbul ignore next
export function createFakeClientBase(subject: typeof WebSocket): typeof WebSocket {
  return class {
    static CONNECTING = subject.CONNECTING
    static CLOSING = subject.CLOSING
    static CLOSED = subject.CLOSED
    static OPEN = subject.OPEN
    static Server = subject.Server
    static listenerCount = subject.listenerCount
    static defaultMaxListeners = subject.defaultMaxListeners
    static EventEmitter = subject.EventEmitter

    webSocket: WebSocket
    constructor(address: string, options?: ClientOptions) {
      this.webSocket = new subject(address, options)
    }
    get binaryType() {
      return this.webSocket.binaryType
    }
    set binaryType(value) {
      this.webSocket.binaryType = value
    }
    get bufferedAmount() {
      return this.webSocket.bufferedAmount
    }
    set bufferedAmount(value) {
      this.webSocket.bufferedAmount = value
    }
    get extensions() {
      return this.webSocket.extensions
    }
    set extensions(value) {
      this.webSocket.extensions = value
    }
    get protocol() {
      return this.webSocket.protocol
    }
    set protocol(value) {
      this.webSocket.protocol = value
    }
    get readyState() {
      return this.webSocket.readyState
    }
    set readyState(value) {
      this.webSocket.readyState = value
    }
    get url() {
      return this.webSocket.url
    }
    set url(value) {
      this.webSocket.url = value
    }
    get CONNECTING() {
      return this.webSocket.CONNECTING
    }
    set CONNECTING(value) {
      this.webSocket.CONNECTING = value
    }
    get OPEN() {
      return this.webSocket.OPEN
    }
    set OPEN(value) {
      this.webSocket.OPEN = value
    }
    get CLOSING() {
      return this.webSocket.CLOSING
    }
    set CLOSING(value) {
      this.webSocket.CLOSING = value
    }
    get CLOSED() {
      return this.webSocket.CLOSED
    }
    set CLOSED(value) {
      this.webSocket.CLOSED = value
    }
    get onopen() {
      return this.webSocket.onopen
    }
    set onopen(value) {
      this.webSocket.onopen = value
    }
    get onerror() {
      return this.webSocket.onerror
    }
    set onerror(value) {
      this.webSocket.onerror = value
    }
    get onclose() {
      return this.webSocket.onclose
    }
    set onclose(value) {
      this.webSocket.onclose = value
    }
    get onmessage() {
      return this.webSocket.onmessage
    }
    set onmessage(value) {
      this.webSocket.onmessage = value
    }
    get close() {
      return this.webSocket.close
    }
    set close(value) {
      this.webSocket.close = value
    }
    get ping() {
      return this.webSocket.ping
    }
    set ping(value) {
      this.webSocket.ping = value
    }
    get pong() {
      return this.webSocket.pong
    }
    set pong(value) {
      this.webSocket.pong = value
    }
    get addEventListener() {
      return this.webSocket.addEventListener
    }
    set addEventListener(value) {
      this.webSocket.addEventListener = value
    }
    get removeEventListener() {
      return this.webSocket.removeEventListener
    }
    set removeEventListener(value) {
      this.webSocket.removeEventListener = value
    }
    get addListener() {
      return this.webSocket.addListener
    }
    set addListener(value) {
      this.webSocket.addListener = value
    }
    get removeListener() {
      return this.webSocket.removeListener
    }
    set removeListener(value) {
      this.webSocket.removeListener = value
    }
    get once() {
      return this.webSocket.once
    }
    set once(value) {
      this.webSocket.once = value
    }
    get prependListener() {
      return this.webSocket.prependListener
    }
    set prependListener(value) {
      this.webSocket.prependListener = value
    }
    get prependOnceListener() {
      return this.webSocket.prependOnceListener
    }
    set prependOnceListener(value) {
      this.webSocket.prependOnceListener = value
    }
    get removeAllListeners() {
      return this.webSocket.removeAllListeners
    }
    set removeAllListeners(value) {
      this.webSocket.removeAllListeners = value
    }
    get setMaxListeners() {
      return this.webSocket.setMaxListeners
    }
    set setMaxListeners(value) {
      this.webSocket.setMaxListeners = value
    }
    get getMaxListeners() {
      return this.webSocket.getMaxListeners
    }
    set getMaxListeners(value) {
      this.webSocket.getMaxListeners = value
    }
    get listeners() {
      return this.webSocket.listeners
    }
    set listeners(value) {
      this.webSocket.listeners = value
    }
    get emit() {
      return this.webSocket.emit
    }
    set emit(value) {
      this.webSocket.emit = value
    }
    get eventNames() {
      return this.webSocket.eventNames
    }
    set eventNames(value) {
      this.webSocket.eventNames = value
    }
    get listenerCount() {
      return this.webSocket.listenerCount
    }
    set listenerCount(value) {
      this.webSocket.listenerCount = value
    }

    on(event, listener) {
      return this.webSocket.on(event, listener)
    }
    send(message, options?, cb?) {
      this.webSocket.send(message, options, cb)
    }
    terminate() {
      this.webSocket.terminate()
    }
  } as any
}
