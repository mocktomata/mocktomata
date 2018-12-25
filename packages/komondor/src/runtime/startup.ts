import { createIO } from '@komondor-lab/io-client';
import isNode from 'is-node';
import { setConfig } from '../config';
import { discoverKomondorServer } from './discoverKomondorServer';
import { loadConfig } from './loadConfig';

/**
 * Initialize komondor.
 * This function will be called immediately upon load in `ready.ts`.
 * This is ok because `komondor` is in the main boundary.
 */
export async function startup() {
  // load config
  // load plugins
  if (isNode) {
    const config = loadConfig(process.cwd())
    setConfig(config)
  }
  else {
    const serverInfo = await discoverKomondorServer()
    const io = createIO({ url: serverInfo.url })
    const config = await io.loadConfig()
    setConfig(config)
  }
}
