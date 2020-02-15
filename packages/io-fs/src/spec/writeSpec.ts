import path from 'path'
import { ensureFolderCreated, writeTo } from '../util'

export function writeSpec(specFolder: string, title: string, invokePath: string, data: string) {
  const specDir = path.join(specFolder, invokePath)
  ensureFolderCreated(specDir)
  writeTo(specDir, title, data)
}
