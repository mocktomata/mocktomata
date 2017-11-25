export type Predicate = (value: any) => boolean
export type Expecter = ExpecterHash | ExpectorNode[]

export type ExpectorNode = boolean | number | string | RegExp | Predicate | ExpecterHash

export type ExpecterHash = { [i: string]: ExpectorNode | ExpectorNode[] }

export type Struct = StructNode | StructHash | (StructNode | StructHash)[]

export type StructNode = boolean | number | string | object

export type StructHash = { [i: string]: Struct }
