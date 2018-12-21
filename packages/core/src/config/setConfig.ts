import { unpartial } from 'unpartial';
import { store } from '../runtime';
import { ConfigPropertyIsInvalid, ConfigPropertyNotRecognized } from './errors';
import { KomondorConfig } from './interfaces';
import { createDefaultConfig } from './createDefaultConfig';

export function setConfig(options: KomondorConfig) {
  validateOptions(options)
  store.set('config', unpartial<KomondorConfig>(createDefaultConfig(), options))
}

function validateOptions(options: KomondorConfig) {
  if (!options) return
  Object.keys(options).forEach(k => {
    switch (k) {
      case 'url':
        if (options.url && !isValidUrl(options.url))
          throw new ConfigPropertyIsInvalid('url', `${options.url} is not a valid url`)
        break
      case 'plugins':
        if (!Array.isArray(options.plugins))
          throw new ConfigPropertyIsInvalid('plugins', 'it should be an array of plugin names.')
        break;
      default:
        throw new ConfigPropertyNotRecognized(k)
    }
  })
}

function isValidUrl(url: string) {
  return /^http:\/\/\w+(:\d+)?/.test(url)
}
