"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleCallback = {
    increment(callback, x) {
        return new Promise((a, r) => {
            callback(x, (err, response) => {
                if (err)
                    r(err);
                a(response);
            });
        });
    },
    success(a, callback) {
        callback(null, a + 1);
    },
    fail(a, callback) {
        callback({ message: 'fail' }, null);
    }
};
//# sourceMappingURL=testSuite.js.map