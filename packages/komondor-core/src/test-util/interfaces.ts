import { Spec } from '../spec';

export type TestHandler = (title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>
