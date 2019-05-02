export const simpleCallback = {
  increment(callback: (x: number, callback: (err: any, resposne: number) => void) => void, x: number) {
    return new Promise<number>((a, r) => {
      callback(x, (err, response) => {
        if (err) r(err)
        a(response)
      })
    })
  },
  success(a: number, callback: (err: any, response: number) => void) {
    callback(null, a + 1)
  },
  fail(a: number, callback: (err: any, response: null) => void) {
    callback({ message: 'fail' }, null)
  }
}
