export type Predicate = (value: any) => boolean

export type Expecter<T extends Struct = Struct> = ExpecterHash<T> | ExpecterHash<T>[]
export type ExpecterNode<T extends Struct = Struct> = undefined | boolean | number | string | RegExp | Predicate | ExpecterHash<T>
export type ExpecterHash<T extends Struct = Struct> = {
  [P in keyof T]: ExpecterNode<T[P]> | ExpecterNode<T[P]>[];
}

export type Struct = StructNode | StructHash | (StructNode | StructHash)[]

export type StructNode = boolean | number | string | object

export type StructHash = { [i: string]: Struct }

export interface SatisfierExec {
  path: string[],
  expected: any,
  actual: any
}
