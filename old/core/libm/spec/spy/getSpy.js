// import { unartifactify } from './artifactify';
// import { isClass } from './class/isClass';
export function getSpy(context, plugin, subject) {
    if (subject === undefined || subject === null)
        return subject;
    const spy = plugin.getSpy(context, subject);
    // return isClass(subject) ?
    //   function (...args) {
    //     return new spy(...unartifactify(args))
    //   } : spy
    return spy;
}
//# sourceMappingURL=getSpy.js.map