export class Dummy {
  // class detection requires to have at least one method defined.
  do() { return; }
}

export const simpleCallback = {
  increment(remote: Function, value: number) {
    return new Promise<number>((a, r) => {
      remote(value, (err: Error | undefined, response: number) => {
        if (err) r(err)
        a(response)
      })
    })
  },
  success(value: number, callback: (err: any, result: number) => void) {
    callback(null, value + 1)
  },
  fail(value: number, callback: (err: any, result?: number) => void) {
    callback(new Error('fail'))
  }
}

export const fetch = {
  add(fetch: any, x: number, y: number) {
    return new Promise((a, r) => {
      fetch('remoteAdd', { x, y }, (err: any, response: number | null) => {
        if (err) r(err)
        a(response)
      })
    })
  },
  success(_url: string, options: { x: number, y: number }, callback: (err: any, response: number | null) => void) {
    callback(null, options.x + options.y)
  },
  fail(_url: string, _options: any, callback: (err: any, response: number | null) => void) {
    callback({ message: 'fail' }, null)
  }
}

export const callbackInObjLiteral = {
  increment(remote: Function, x: number) {
    return new Promise((a, r) => {
      remote({
        data: x,
        error(_xhr: any, _textStatus: string, errorThrown: Error) {
          r(errorThrown)
        },
        success(data: number, _textStatus: string, _xhr: any) {
          a(data)
        }
      })
    })
  },
  success(options: { data: number, success: Function }) {
    options.success(options.data + 1)
  },
  fail(options: { data: number, success: Function, error: Function }) {
    options.error(null, 'failStatus', new Error('fail'))
  }
}

export const callbackInDeepObjLiteral = {
  increment(remote: Function, x: number) {
    return new Promise((a, r) => {
      remote({
        data: x,
        handlers: {
          error(_xhr: any, _textStatus: string, errorThrown: Error) {
            r(errorThrown)
          },
          success(data: number, _textStatus: string, _xhr: any) {
            a(data)
          }
        }
      })
    })
  },
  success(options: { data: number, handlers: { success: Function } }) {
    options.handlers.success(options.data + 1)
  },
  fail(options: { data: number, handlers: { error: Function } }) {
    options.handlers.error(null, 'failStatus', { message: 'fail' })
  }
}

export const synchronous = {
  increment(remote: (x: number) => number, x: number) {
    return remote(x)
  },
  success(x: number) {
    return x + 1
  },
  fail() {
    throw new Error('fail')
  }
}

export const delayed = {
  increment(remote: Function, x: number) {
    return new Promise(a => {
      remote(x, (_: any, response: number) => {
        a(response)
      })
    })
  },
  success(a: number, callback: Function) {
    setImmediate(() => callback(null, a + 1))
  }
}

export const recursive = {
  decrementToZero(remote: Function, x: number) {
    return new Promise(a => {
      remote(x, (_: any, response: number) => {
        a(response > 0 ?
          recursive.decrementToZero(remote, x - 1) :
          response)
      })
    })
  },
  success(a: number, callback: Function) {
    callback(null, a - 1)
  }
}

export const postReturn = {
  fireEvent(name: string, times: number, callback: Function) {
    setImmediate(() => {
      for (let i = 0; i < times; i++)
        callback(name)
    })
    return
  }
}
