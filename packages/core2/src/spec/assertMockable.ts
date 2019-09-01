import { NotSpecable } from './errors';
import { isSpecable } from './isSpecable';

export function assertMockable(subject: any) {
  if (!isSpecable(subject)) throw new NotSpecable(subject)
}
