import { artifactify } from './artifactify';
import { MissingArtifact } from './errors';
import { store } from './store';
import { artifactKey } from './constants';
/**
 * create an artifact out of the original value.
 * Note that artifact object cannot be used in enumerating comparision,
 * such as `t.deepStrictEqual()`.
 * @param original original value. It should be simple object (think struct)
 */
export function artifact(id, original) {
    const { artifacts, defaultArtifacts } = store.get();
    const defaultArtifact = defaultArtifacts[id];
    if (defaultArtifact !== undefined)
        return defaultArtifact;
    if (original === undefined) {
        const a = artifacts[id];
        if (a === undefined)
            throw new MissingArtifact(id);
        return a;
    }
    return artifacts[id] = artifactify(original);
}
export function overruleArtifact(id, override) {
    const { defaultArtifacts } = store.get();
    return defaultArtifacts[id] = artifactify(override);
}
//# sourceMappingURL=artifact.js.map