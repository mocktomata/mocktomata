// // import { createSpec } from './createSpec'
// import { Spec } from './interfaces';
// import { io } from './io';
// import { runtime } from './runtime';

// export interface SpecFn {
//   <T>(subject: T): Promise<Spec<T>>
//   <T>(id: string, subject: T): Promise<Spec<T>>
//   save<T>(id: string, subject: T): Promise<Spec<T>>
//   simulate<T>(id: string, subject: T): Promise<Spec<T>>
// }

// const notSubject = Symbol()

// function live(id, subject: any = notSubject) {
//   if (subject === notSubject) {
//     subject = id
//     id = ''
//   }
//   const mode = runtime.getMode(id, 'live')
//   return createSpec({ io }, id, subject, mode)
// }

// function save<T>(id: string, subject: T): Promise<Spec<T>> {
//   const mode = runtime.getMode(id, 'save')
//   return createSpec({ io }, id, subject, mode)
// }

// function simulate<T>(id: string, subject: T): Promise<Spec<T>> {
//   const mode = runtime.getMode(id, 'simulate')
//   return createSpec({ io }, id, subject, mode)
// }

// export const spec: SpecFn = Object.assign(
//   live,
//   {
//     save,
//     simulate
//   }
// )
