export type Predicate = (value: any) => boolean

export type Expecter<T extends Struct = Struct> = Partial<ExpecterHash<T>> | Partial<ExpecterHash<T>>[]
export type ExpecterNode<T extends Struct = Struct> = undefined | boolean | number | string | RegExp | Predicate | Partial<ExpecterHash<T>>
export type ExpecterHash<T extends Struct = Struct> = {
  [P in keyof T]: ExpecterNode<T[P]> | ExpecterNode<T[P]>[];
}

export declare type PartialExpecter<T extends Struct = Struct> = Partial<PartialExpecterHash<T>> | PartialExpecterHash<T>[];
export declare type PartialExpecterNode<T extends Struct = Struct> = undefined | boolean | number | string | RegExp | Predicate | Partial<PartialExpecterHash<T>>
export declare type PartialExpecterHash<T extends Struct = Struct> = {
  [P in keyof T]: Partial<PartialExpecterNode<T[P]>> | PartialExpecterNode<T[P]>[];
};


export type Struct = StructNode | StructHash | (StructNode | StructHash)[]

export type StructNode = boolean | number | string | object

export type StructHash = { [i: string]: Struct }

export interface SatisfierExec {
  path: string[],
  expected: any,
  actual: any
}
