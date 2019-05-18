import { KomondorPlugin } from '../../types';
import { KeyTypes } from 'type-plus'

export const objectPlugin: KomondorPlugin<Record<KeyTypes, any>> = {
  name: 'object',
  support: subject => typeof subject === 'object',
  getSpy: (context, subject) => {
    return subject
  },
  getStub: (context, subject) => {
    return subject
  }
}
