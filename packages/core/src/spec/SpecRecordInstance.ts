import { SpecAction } from './types';
import { SpecReferenceLive } from './typesInternal';

export class SpecRecordInstance {
  public refs: SpecReferenceLive[] = []
  public actions: SpecAction[] = []
  addReference(plugin: string, subject: any, target: any, serialize = true) {
    const ref = this.findRef(target)
    if (!ref) {
      this.refs.push(serialize ? { plugin, subject, target, serialize } : { plugin, subject, target })
      return String(this.refs.length - 1)
    }

    return ref
  }

  findRef(target: any) {
    const id = this.refs.findIndex(ref => ref.target === target)
    return (id !== -1) ? String(id) : undefined
  }
}
