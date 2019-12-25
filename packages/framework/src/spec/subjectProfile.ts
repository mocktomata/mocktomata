import { SpecRecord } from './types'

export function getDefaultPerformer(profile: SpecRecord.SubjectProfile) {
  switch (profile) {
    case 'target':
    case 'output':
      return 'user'
    case 'input':
      return 'mockto'
    default:
      throw new Error(`unknown subject profile ${profile}`)
  }
}
