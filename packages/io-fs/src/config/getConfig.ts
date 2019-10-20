import { required } from 'type-plus';
import { MOCKTOMATA_FOLDER } from '../constants';
import { FileRepositoryOptions } from '../types';
import { loadConfig } from './loadConfig';

const defaultConfig: Pick<FileRepositoryOptions, 'folder'> = {
  folder: MOCKTOMATA_FOLDER,
}

export function getConfig(cwd: string) {
  return required<FileRepositoryOptions>(defaultConfig, loadConfig(cwd))
}
