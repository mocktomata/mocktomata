import boom from 'boom';
import { Server } from 'hapi';
import path from 'path';
import { required } from 'unpartial';
import { context } from './context';
export async function start(options) {
    const o = required({}, options);
    const server = o.port ?
        new Server({ port: o.port, routes: { 'cors': true } }) :
        await tryCreateHapi(3698, 3698, 3708);
    defineRoutes(server);
    await server.start();
    return {
        info: server.info,
        stop(options) {
            return server.stop(options);
        }
    };
}
async function tryCreateHapi(port, start, end) {
    // istanbul ignore next
    if (port > end) {
        throw new Error(`Unable to start komondor server using port from ${start} to ${end}`);
    }
    try {
        const server = new Server({ port, routes: { 'cors': true } });
        await server.start();
        await server.stop();
        return server;
    }
    catch {
        return tryCreateHapi(port + 1, start, end);
    }
}
function defineRoutes(server) {
    server.route([
        {
            method: 'GET',
            path: '/komondor/info',
            handler: async (request) => {
                const pjson = require(path.resolve(__dirname, '../package.json'));
                return JSON.stringify({
                    name: 'komondor',
                    version: pjson.version,
                    url: getReflectiveUrl(request.info, server.info),
                    plugins: await context.get().repository.getPluginList()
                });
            }
        },
        // {
        //   method: 'GET',
        //   path: '/komondor/config',
        //   options: { cors: true },
        //   handler: async (request, h) => {
        //     return JSON.stringify(loadConfig(cwd))
        //   }
        // },
        {
            method: 'GET',
            path: '/komondor/specs/{id}',
            handler: async (request) => {
                try {
                    return await context.get().repository.readSpec(request.params.id);
                }
                catch (e) {
                    throw boom.notFound(e.message);
                }
            }
        },
        {
            method: 'POST',
            path: '/komondor/specs/{id}',
            handler: async (request, h) => {
                await context.get().repository.writeSpec(request.params.id, request.payload);
                return h.response();
            }
        },
        {
            method: 'GET',
            path: '/komondor/scenarios/{id}',
            handler: async (request) => {
                try {
                    return await context.get().repository.readScenario(request.params.id);
                }
                catch (e) {
                    throw boom.notFound(e.message);
                }
            }
        },
        {
            method: 'POST',
            path: '/komondor/scenarios/{id}',
            handler: async (request, h) => {
                await context.get().repository.writeScenario(request.params.id, request.payload);
                return h.response();
            }
        }
    ]);
}
/**
 * If request is calling from local, return as localhost.
 */
function getReflectiveUrl(requestInfo, serverInfo) {
    if (requestInfo.remoteAddress === '127.0.0.1') {
        return `${serverInfo.protocol}://localhost:${serverInfo.port}`;
    }
    // istanbul ignore next
    return serverInfo.uri;
}
//# sourceMappingURL=start.js.map