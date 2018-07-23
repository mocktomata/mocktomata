"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const artifactify_1 = require("./artifactify");
const errors_1 = require("./errors");
const store_1 = require("./store");
const constants_1 = require("./constants");
/**
 * create an artifact out of the original value.
 * Note that artifact object cannot be used in enumerating comparision,
 * such as `t.deepStrictEqual()`.
 * @param original original value. It should be simple object (think struct)
 */
function artifact(id, original) {
    const { artifacts, defaultArtifacts } = store_1.store.get();
    const defaultArtifact = defaultArtifacts[id];
    if (defaultArtifact !== undefined)
        return defaultArtifact;
    if (original === undefined) {
        const a = artifacts[id];
        if (a === undefined)
            throw new errors_1.MissingArtifact(id);
        return a;
    }
    return artifacts[id] = artifactify_1.artifactify(original);
}
exports.artifact = artifact;
function overruleArtifact(id, override) {
    const { defaultArtifacts } = store_1.store.get();
    return defaultArtifacts[id] = artifactify_1.artifactify(override);
}
exports.overruleArtifact = overruleArtifact;
//# sourceMappingURL=artifact.js.map