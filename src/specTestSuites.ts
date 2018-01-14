
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
  success(url, options, callback) {
    if (url === 'remoteAdd')
      callback(null, options.x + options.y)
  },
  fail(url, _options, callback) {
    if (url === 'remoteAdd')
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
