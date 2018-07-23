export const simpleCallback = {
    increment(remote, value) {
        return new Promise((a, r) => {
            remote(value, (err, response) => {
                if (err)
                    r(err);
                a(response);
            });
        });
    },
    success(value, callback) {
        callback(null, value + 1);
    },
    fail(value, callback) {
        callback(new Error('fail'));
    }
};
export const fetch = {
    add(fetch, x, y) {
        return new Promise((a, r) => {
            fetch('remoteAdd', { x, y }, (err, response) => {
                if (err)
                    r(err);
                a(response);
            });
        });
    },
    success(_url, options, callback) {
        callback(null, options.x + options.y);
    },
    fail(_url, _options, callback) {
        callback({ message: 'fail' }, null);
    }
};
export const literalCallback = {
    increment(remote, x) {
        return new Promise((a, r) => {
            remote({
                data: x,
                error(_xhr, _textStatus, errorThrown) {
                    r(errorThrown);
                },
                success(data, _textStatus, _xhr) {
                    a(data);
                }
            });
        });
    },
    success(options) {
        options.success(options.data + 1);
    },
    fail(options) {
        options.error(null, 'failStatus', { message: 'fail' });
    }
};
export const synchronous = {
    increment(remote, x) {
        return remote('increment', x);
    },
    success(_url, x) {
        return x + 1;
    },
    fail() {
        throw new Error('fail');
    }
};
export const delayed = {
    increment(remote, x) {
        return new Promise(a => {
            remote(x, (_, response) => {
                a(response);
            });
        });
    },
    success(a, callback) {
        setTimeout(() => {
            callback(null, a + 1);
        }, 10);
    }
};
export const recursive = {
    decrementToZero(remote, x) {
        return new Promise(a => {
            remote(x, (_, response) => {
                a(response > 0 ?
                    recursive.decrementToZero(remote, x - 1) :
                    response);
            });
        });
    },
    success(a, callback) {
        callback(null, a - 1);
    }
};
export const postReturn = {
    fireEvent(name, times, callback) {
        setImmediate(() => {
            for (let i = 0; i < times; i++)
                callback(name);
        });
        return;
    }
};
//# sourceMappingURL=testSuites.js.map