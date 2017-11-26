import { tersible } from 'tersify';

export function isInRange(start: number, end: number) {
  return tersible(a => a >= start && a <= end, () => `[${start}...${end}]`)
}
