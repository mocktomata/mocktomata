import { tersify } from 'tersify';
import { log } from '../util';
import { RecordingRecord } from './createRecordingRecord';

export type ActionLoggingContext = {
  record: Pick<RecordingRecord, 'getSubject'>;
  plugin: string;
  ref: string | number;
}

export function logInstantiateAction({ record, plugin, ref }: ActionLoggingContext, id: number, args: any[]) {
  log.onDebug(log => log(`${plugin} ${ref}/${id}: instantiate with ${tersify(args)}\n${tersify(record.getSubject(ref))}`));
}

export function logInvokeAction({ record, plugin, ref }: ActionLoggingContext, id: number, args: any[]) {
  log.onDebug(log => log(`${plugin} ${ref}/${id}: invoke with ${tersify(args)}\n${tersify(record.getSubject(ref))}`))
}

export function logGetAction({ record, plugin, ref }: ActionLoggingContext, id: number, name: string | number) {
  log.onDebug(log => log(`${plugin} ${ref}/${id}: get ${typeof name === 'string' ? `'${name}'` : name}\n${tersify(record.getSubject(ref))}`))
}

export function logSetAction({ record, plugin, ref }: ActionLoggingContext, id: number, name: string | number, value: any) {
  log.onDebug(log => log(`${plugin} ${ref}/${id}: set ${typeof name === 'string' ? `'${name}'` : name} with ${value}\n${tersify(record.getSubject(ref))}`))
}

export function logReturnAction({ plugin, ref }: Omit<ActionLoggingContext, 'record'>, sourceId: number, id: number, value: any) {
  log.onDebug(() => `${plugin} ${ref}/${sourceId}/${id}: returns ${value}`)
}

export function logThrowAction({ plugin, ref }: Omit<ActionLoggingContext, 'record'>, sourceId: number, id: number, value: any) {
  log.onDebug(() => `${plugin} ${ref}/${sourceId}/${id}: throws ${value}`)
}
