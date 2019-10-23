import { SpecMode } from './spec/types'

export type MocktomataOptions = {
  overrideMode?: SpecMode,
  filePathFilter?: RegExp,
  specNameFilter?: RegExp
}

export const config = function (options: MocktomataOptions) {

}
