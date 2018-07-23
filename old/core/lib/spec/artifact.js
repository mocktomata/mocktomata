"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var artifactify_1 = require("./artifactify");
var errors_1 = require("./errors");
var store_1 = require("./store");
var constants_1 = require("./constants");
/**
 * create an artifact out of the original value.
 * Note that artifact object cannot be used in enumerating comparision,
 * such as `t.deepStrictEqual()`.
 * @param original original value. It should be simple object (think struct)
 */
function artifact(id, original) {
    var _a = store_1.store.get(), artifacts = _a.artifacts, defaultArtifacts = _a.defaultArtifacts;
    var defaultArtifact = defaultArtifacts[id];
    if (defaultArtifact !== undefined)
        return defaultArtifact;
    if (original === undefined) {
        var a = artifacts[id];
        if (a === undefined)
            throw new errors_1.MissingArtifact(id);
        return a;
    }
    return artifacts[id] = artifactify_1.artifactify(original);
}
exports.artifact = artifact;
function overruleArtifact(id, override) {
    var defaultArtifacts = store_1.store.get().defaultArtifacts;
    return defaultArtifacts[id] = artifactify_1.artifactify(override);
}
exports.overruleArtifact = overruleArtifact;
//# sourceMappingURL=artifact.js.map