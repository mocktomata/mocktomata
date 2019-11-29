import { SubjectProfile } from './types';

export function getDefaultPerformer(profile: SubjectProfile) {
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
