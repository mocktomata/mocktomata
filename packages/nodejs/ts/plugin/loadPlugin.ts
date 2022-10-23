import { PluginNotFound, SpecPlugin } from '@mocktomata/framework'

// istanbul ignore next
export async function loadPlugin(cwd: string, id: string): Promise<SpecPlugin.Module> {
  try {
    return await import(id)
  }
  catch (e: any) {
    throw new PluginNotFound(id)
  }
}
