"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { unartifactify } from './artifactify';
// import { isClass } from './class/isClass';
function getSpy(context, plugin, subject) {
    if (subject === undefined || subject === null)
        return subject;
    var spy = plugin.getSpy(context, subject);
    // return isClass(subject) ?
    //   function (...args) {
    //     return new spy(...unartifactify(args))
    //   } : spy
    return spy;
}
exports.getSpy = getSpy;
//# sourceMappingURL=getSpy.js.map