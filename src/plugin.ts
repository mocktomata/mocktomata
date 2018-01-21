import { genericFunction } from './genericFunction'
const plugins: any[] = [genericFunction]
export const plugin = {
  register(plugin) {
    plugins.unshift(plugin)
  },
  getSpy({ resolve, store }, subject) {
    const p = plugins.find(p => p.canHandleSubject(subject))
    return p.getSpy({ resolve, store }, subject)
  },
  getStub({ resolve, store }, subject, id) {
    const p = plugins.find(p => p.canHandleSubject(subject))
    return p.getStub({ resolve, store }, subject, id)
  }
}
