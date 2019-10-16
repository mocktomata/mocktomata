// import { SpecMode } from '@moctomata/framework';
// import { createIO } from '@komondor-lab/io-client';
// import { loadPlugins, registerPlugin } from '@komondor-lab/plugin';
// import { getLogger, logLevel } from '@unional/logging';
// import { createContext } from 'async-fp';

// const context = createContext(async () => {
//   const logger = getLogger('komondor', logLevel.warn)

//   const io = await createIO()
//   const libs: string[] = []
//   libs.forEach(async lib => {
//     registerPlugin(lib, await io.loadPlugin(lib))
//   })
//   await loadPlugins({ io })

//   return { logger, io }
// })


// export const config = {
//   spec(mode: SpecMode, ...filters: (string | RegExp)[]) {
//     return
//   },
//   scenario(mode: SpecMode, ...filters: (string | RegExp)[]) {
//     return
//   }
// }
