// // This is komonodor exposed as window.komondor. Used by developer to control komondor behavior.
// // developer can control spec and scenario behaviors, but not config.
// // config is done by the application startup code.
// import { SpecMode } from '@mocktomata/framework';
// import { createIO } from '@mocktomata/io-client';
// import { loadPlugins, registerPlugin } from '@mocktomata/plugin';
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
export const dummy = 0

// export const config = {
//   spec(mode: SpecMode, ...filters: (string | RegExp)[]) {
//     return
//   },
//   scenario(mode: SpecMode, ...filters: (string | RegExp)[]) {
//     return
//   }
// }
