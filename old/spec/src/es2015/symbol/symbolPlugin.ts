import { KomondorPlugin } from '../../types';

export const symbolPlugin: KomondorPlugin = {
  support: subject => {
    const type = typeof subject
    return type === 'symbol' || (type === 'object' && Object.prototype.toString.call(subject) === '[object Symbol]')
  },
  getSpy: (_: any, subject: any) => subject,
  getStub: (_: any, subject: any) => subject
}
