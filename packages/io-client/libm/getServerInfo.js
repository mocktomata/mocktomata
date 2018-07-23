import { buildUrl } from './buildUrl';
import { ServerNotAvailable, ServerNotAvailableAtPortRange } from './errors';
export async function getServerInfo(context, options) {
    return options ? tryGetServerInfo(context, options.url) : lookupServerInfo(context);
}
async function lookupServerInfo(context) {
    const { location } = context;
    const url = `${location.protocol}//${location.hostname}`;
    if (location.hostname === 'localhost') {
        return tryGetServerInfoAtPort(context, url, 3698, 3698, 3708);
    }
    else {
        return tryGetServerInfo(context, url);
    }
}
async function tryGetServerInfoAtPort(context, urlBase, port, start, end) {
    if (port >= end) {
        throw new ServerNotAvailableAtPortRange(urlBase, start, end);
    }
    const url = `${urlBase}:${port}`;
    try {
        return await tryGetServerInfo(context, url);
    }
    catch {
        return tryGetServerInfoAtPort(context, urlBase, port + 1, start, end);
    }
}
async function tryGetServerInfo({ fetch }, url) {
    try {
        const response = await fetch(buildUrl(url, 'info'));
        return response.json();
    }
    catch (e) {
        throw e.code === 'ECONNREFUSED' ? new ServerNotAvailable(url) : e;
    }
}
//# sourceMappingURL=getServerInfo.js.map