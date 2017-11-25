export type Predicate = (value: any) => boolean
export type Expecter = ExpecterHash | ExpecterNode[]

export type ExpecterNode = boolean | number | string | RegExp | Predicate | ExpecterHash

export type ExpecterHash = { [i: string]: ExpecterNode | ExpecterNode[] }

export type Struct = StructNode | StructHash | (StructNode | StructHash)[]

export type StructNode = boolean | number | string | object

export type StructHash = { [i: string]: Struct }
