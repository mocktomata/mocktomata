"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleCallback = {
    increment: function (callback, x) {
        return new Promise(function (a, r) {
            callback(x, function (err, response) {
                if (err)
                    r(err);
                a(response);
            });
        });
    },
    success: function (a, callback) {
        callback(null, a + 1);
    },
    fail: function (a, callback) {
        callback({ message: 'fail' }, null);
    }
};
//# sourceMappingURL=testSuite.js.map