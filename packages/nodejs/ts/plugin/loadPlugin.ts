import { PluginNotFound } from '@mocktomata/framework'

// istanbul ignore next
export async function loadPlugin(cwd: string, id: string): Promise<any> {
	try {
		return await import(id)
	} catch (e: any) {
		throw new PluginNotFound(id)
	}
}
