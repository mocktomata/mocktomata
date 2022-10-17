import type { AnyFunction } from 'type-plus'

export class Dummy {
  // class detection requires to have at least one method defined.
  // istanbul ignore next
  do() { return }
}

export class ChildOfDummy extends Dummy {
  // istanbul ignore next
  doDumber() { return }
}

export const simpleCallback = {
  increment(remote: AnyFunction, value: number) {
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
  increment(remote: AnyFunction, x: number) {
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
  success(options: { data: number, success: AnyFunction }) {
    options.success(options.data + 1)
  },
  fail(options: { data: number, success: AnyFunction, error: AnyFunction }) {
    options.error(null, 'failStatus', new Error('fail'))
  }
}

export const callbackInDeepObjLiteral = {
  increment(remote: AnyFunction, x: number) {
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
  success(options: { data: number, handlers: { success: AnyFunction } }) {
    options.handlers.success(options.data + 1)
  },
  fail(options: { data: number, handlers: { error: AnyFunction } }) {
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
  increment(remote: AnyFunction, x: number) {
    return new Promise(a => {
      remote(x, (_: any, response: number) => {
        a(response)
      })
    })
  },
  success(a: number, callback: AnyFunction) {
    setImmediate(() => callback(null, a + 1))
  }
}

export const recursive = {
  decrementToZero(remote: AnyFunction, x: number) {
    return new Promise(a => {
      remote(x, (_: any, response: number) => {
        a(response > 0 ?
          recursive.decrementToZero(remote, x - 1) :
          response)
      })
    })
  },
  success(a: number, callback: AnyFunction) {
    callback(null, a - 1)
  }
}

export const postReturn = {
  fireEvent(name: string, times: number, callback: AnyFunction) {
    setImmediate(() => {
      for (let i = 0; i < times; i++)
        callback(name)
    })
    return
  }
}
export class WithProperty {
  y = 1
  do(x: any) { return x }
}
export class WithStaticProp {
  static x = 1
}
export class WithStaticMethod {
  static do() { return 'foo' }
}

export class ApiGateway {
  public users: any[] = []
  constructor(public host: string) { }
  createUser(username: string) {
    return new Promise(a => {
      setImmediate(() => {
        const user = { username }
        this.users.push(user)
        a(user)
      })
    })
  }
  getUser(username: string) {
    return new Promise<any>(a => {
      setImmediate(() => {
        const user = this.users.find(u => u.username === username)
        a(user)
      })
    })
  }
  renameUser(oldUsername: string, newUsername: string) {
    return this.getUser(oldUsername)
      .then(user => {
        if (user) {
          user.username = newUsername
          return user
        }
        else {
          throw new Error('user not found')
        }
      })
  }
  deleteUser(username: string) {
    return new Promise<void>(a => {
      setImmediate(() => {
        const i = this.users.findIndex(u => u.username === username)
        if (i >= 0)
          this.users.splice(i, 1)
        a()
      })
    })
  }
}
