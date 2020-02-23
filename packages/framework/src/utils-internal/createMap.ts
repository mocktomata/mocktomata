export function createMap() {
  if (Map) {
    const map = new Map<any, any>()
    return {
      set(instance: any, value: any) {
        map.set(instance, value)
      },
      get(instance: any) {
        return map.get(instance)!
      }
    }
  }

  const list: { instance: any, value: any }[] = []
  return {
    set(instance: any, value: any) {
      list.push({ instance, value })
    },
    get(instance: any) {
      return list.find(n => n.instance === instance)!.value
    }
  }
}
