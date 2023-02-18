import { PluginNotFound } from '@mocktomata/framework'
import { findByKeywords } from 'find-installed-packages'
import { MOCKTOMATA_PLUGIN_KEYWORD } from './constants.js'

// istanbul ignore next
export async function loadPlugin(cwd: string, id: string): Promise<any> {
	try {
		return await import(id)
	} catch (e: any) {
		throw new PluginNotFound(id)
	}
}

export function findInstalledPlugins(cwd: string) {
	return findByKeywords([MOCKTOMATA_PLUGIN_KEYWORD], { cwd })
}
