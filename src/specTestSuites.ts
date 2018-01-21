import { setImmediate } from 'timers'

export const simpleCallback = {
  increment(remote, x) {
    return new Promise((a, r) => {
      remote(x, (err, response) => {
        if (err) r(err)
        a(response)
      })
    })
  },
  success(a, callback) {
    callback(null, a + 1)
  },
  fail(_a, callback) {
    callback({ message: 'fail' }, null)
  }
}

export const fetch = {
  add(fetch, x, y) {
    return new Promise((a, r) => {
      fetch('remoteAdd', { x, y }, (err, response) => {
        if (err) r(err)
        a(response)
      })
    })
  },
  success(_url, options, callback) {
    callback(null, options.x + options.y)
  },
  fail(_url, _options, callback) {
    callback({ message: 'fail' }, null)
  }
}

export const literalCallback = {
  increment(remote, x) {
    return new Promise((a, r) => {
      remote({
        data: x,
        error(_xhr, _textStatus, errorThrown) {
          r(errorThrown)
        },
        success(data, _textStatus, _xhr) {
          a(data)
        }
      })
    })
  },
  success(options) {
    options.success(options.data + 1)
  },
  fail(options) {
    options.error(null, 'failStatus', { message: 'fail' })
  }
}

export const promise = {
  increment(remote, x) {
    return remote('increment', x)
  },
  success(_url, x) {
    return Promise.resolve(x + 1)
  },
  fail() {
    return Promise.reject({ message: 'fail' })
  }
}

export const synchronous = {
  increment(remote, x) {
    return remote('increment', x)
  },
  success(_url, x) {
    return x + 1
  },
  fail() {
    throw new Error('fail')
  }
}

export const childProcess = {
  increment(remote, x) {
    return new Promise((a, r) => {
      const result: any[] = []
      const cp = remote('increment', [x])
      cp.on('close', code => a({ result, code }))
      cp.on('error', err => r(err))
      cp.stdout.on('data', chunk => {
        result.push(['stdout', chunk])
      })
      cp.stderr.on('data', chunk => {
        result.push(['stderr', chunk])
      })
    })
  },
  spawnSuccess(_cmd, args) {
    let x = args[0]
    const stdout: any = {}
    const stderr: any = {}
    const cp: any = {}
    setImmediate(() => {
      stdout.data(++x)
      stdout.data(++x)
      stdout.data(++x)
      cp.close(0)
    })
    return {
      stdout: {
        on(event, callback) {
          stdout[event] = callback
        }
      },
      stderr: {
        on(event, callback) {
          stderr[event] = callback
        }
      },
      on(event, callback) {
        cp[event] = callback
      }
    }
  },
  spawnFail(_cmd, args) {
    let x = args[0]
    const stdout: any = {}
    const stderr: any = {}
    const cp: any = {}
    setImmediate(() => {
      stdout.data(++x)
      stderr.data(++x)
      cp.close(1)
    })
    return {
      stdout: {
        on(event, callback) {
          stdout[event] = callback
        }
      },
      stderr: {
        on(event, callback) {
          stderr[event] = callback
        }
      },
      on(event, callback) {
        cp[event] = callback
      }
    }
  }
}

export const delayed = {
  increment(remote, x) {
    return new Promise((a, r) => {
      remote(x, (err, response) => {
        if (err) r(err)
        a(response)
      })
    })
  },
  success(a, callback) {
    setTimeout(() => {
      callback(null, a + 1)
    }, 100)
  }
  // fail(_a, callback) {
  //   callback({ message: 'fail' }, null)
  // }
}
