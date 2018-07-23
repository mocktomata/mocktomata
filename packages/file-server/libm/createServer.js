import { createFileRepository } from '@komondor-lab/io-fs';
import boom from 'boom';
import { Server } from 'hapi';
import path from 'path';
import { required } from 'unpartial';
const pjson = require(path.resolve(__dirname, '../package.json'));
/**
 * @param options.port The port number to start the server with.
 * This should not be specified in normal use. For testing only.
 */
export function createServer(options) {
    const o = required({ port: 3698 }, options);
    const repository = o.repository || createFileRepository(process.cwd());
    let port = o.port;
    const startingPort = port;
    let server = createHapiServer({ repository }, { hapi: { port, routes: { 'cors': true } } });
    let retryCount = 0;
    return {
        info: server.info,
        async start() {
            try {
                return await server.start();
            }
            catch (e) {
                if (e.code === 'EADDRINUSE') {
                    port++;
                    retryCount++;
                    // istanbul ignore next
                    if (retryCount >= 100) {
                        throw new Error(`Unable to start komondor server using port from ${startingPort} to ${startingPort + 100}`);
                    }
                    server = createHapiServer({ repository }, { hapi: { port, routes: { 'cors': true } } });
                    this.info = server.info;
                    return this.start();
                }
                // istanbul ignore next
                throw e;
            }
        },
        stop() {
            return server.stop();
        }
    };
}
function createHapiServer({ repository }, { hapi }) {
    let server = new Server(hapi);
    server.route([
        {
            method: 'GET',
            path: '/komondor/info',
            handler: async (request) => {
                return JSON.stringify({
                    name: 'komondor',
                    version: pjson.version,
                    url: getReflectiveUrl(request.info, server.info),
                    plugins: await repository.getPluginList()
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
            handler: async (request, reply) => {
                try {
                    return await repository.readSpec(request.params.id);
                }
                catch (e) {
                    if (e.code === 'ENOENT') {
                        throw boom.notFound(e.message);
                    }
                }
            }
        },
        {
            method: 'POST',
            path: '/komondor/specs/{id}',
            handler: async (request) => {
                await repository.writeSpec(request.params.id, request.payload);
            }
        },
        {
            method: 'GET',
            path: '/komondor/scenarios/{id}',
            handler: (request) => {
                return repository.readScenario(request.params.id);
            }
        },
        {
            method: 'POST',
            path: '/komondor/scenarios/{id}',
            handler: async (request, h) => {
                await repository.writeScenario(request.params.id, request.payload);
                return h.response();
            }
        }
    ]);
    return server;
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
//# sourceMappingURL=createServer.js.map