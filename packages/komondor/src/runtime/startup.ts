import * as valuePlugin from '../plugin-value'
import * as functionPlugin from '../plugin-function';
import { loadPlugins, registerPlugin } from '../plugin';
import { getIO } from './getIO';
import { logger } from './logger';

export async function startup() {
  const io = await getIO()

  // TODO: config is not typed and validated
  // BODY should the config be validated upfront or at usage?
  const config = await io.loadConfig()

  registerPlugin(valuePlugin)
  registerPlugin(functionPlugin)
  if (config.plugins && config.plugins.length > 0)
    await loadPlugins({ io }, config.plugins)
  return { io, logger }
}
