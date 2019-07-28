import { required } from 'unpartial';
import { KOMONDOR_FOLDER } from '../constants';
import { store } from '../store';
import { loadConfig } from './loadConfig';

const defaultConfig = {
  komondorFolder: KOMONDOR_FOLDER
}

export function getConfig(cwd: string) {
  const config = store.value.config
  if (config) return config

  const c = loadConfig(cwd)
  const newConfig = required(defaultConfig, c)
  store.value.config = newConfig

  return newConfig
}
