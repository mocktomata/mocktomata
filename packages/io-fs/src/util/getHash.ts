import md5 from 'md5';

export function getHash(id: string) {
  return md5(id)
}
