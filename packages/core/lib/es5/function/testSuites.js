"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleCallback = {
    increment: function (remote, value) {
        return new Promise(function (a, r) {
            remote(value, function (err, response) {
                if (err)
                    r(err);
                a(response);
            });
        });
    },
    success: function (value, callback) {
        callback(null, value + 1);
    },
    fail: function (value, callback) {
        callback(new Error('fail'));
    }
};
exports.fetch = {
    add: function (fetch, x, y) {
        return new Promise(function (a, r) {
            fetch('remoteAdd', { x: x, y: y }, function (err, response) {
                if (err)
                    r(err);
                a(response);
            });
        });
    },
    success: function (_url, options, callback) {
        callback(null, options.x + options.y);
    },
    fail: function (_url, _options, callback) {
        callback({ message: 'fail' }, null);
    }
};
exports.literalCallback = {
    increment: function (remote, x) {
        return new Promise(function (a, r) {
            remote({
                data: x,
                error: function (_xhr, _textStatus, errorThrown) {
                    r(errorThrown);
                },
                success: function (data, _textStatus, _xhr) {
                    a(data);
                }
            });
        });
    },
    success: function (options) {
        options.success(options.data + 1);
    },
    fail: function (options) {
        options.error(null, 'failStatus', { message: 'fail' });
    }
};
exports.synchronous = {
    increment: function (remote, x) {
        return remote('increment', x);
    },
    success: function (_url, x) {
        return x + 1;
    },
    fail: function () {
        throw new Error('fail');
    }
};
exports.delayed = {
    increment: function (remote, x) {
        return new Promise(function (a) {
            remote(x, function (_, response) {
                a(response);
            });
        });
    },
    success: function (a, callback) {
        setTimeout(function () {
            callback(null, a + 1);
        }, 10);
    }
};
exports.recursive = {
    decrementToZero: function (remote, x) {
        return new Promise(function (a) {
            remote(x, function (_, response) {
                a(response > 0 ?
                    exports.recursive.decrementToZero(remote, x - 1) :
                    response);
            });
        });
    },
    success: function (a, callback) {
        callback(null, a - 1);
    }
};
exports.postReturn = {
    fireEvent: function (name, times, callback) {
        setImmediate(function () {
            for (var i = 0; i < times; i++)
                callback(name);
        });
        return;
    }
};
//# sourceMappingURL=testSuites.js.map