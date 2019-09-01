import { RequiredPick } from 'type-plus';
import { store } from '../store';
import { SpecPlugin } from './types';

export function findPlugin<S>(subject: S): RequiredPick<SpecPlugin<S, any>, 'name'> | undefined {
  const plugins = store.value.plugins
  return plugins.find(p => p.support(subject))
}
