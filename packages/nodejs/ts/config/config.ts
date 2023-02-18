import { json } from '@mocktomata/framework'
import fs from 'fs'
import json5 from 'json5'
import path from 'path'
import {
	MOCKTOMATA_FILE_PATH_FILTER,
	MOCKTOMATA_LOG_LEVEL, MOCKTOMATA_MODE, MOCKTOMATA_SPEC_NAME_FILTER
} from './constants.js'
import { reduceOr } from './reduceOr.js'
export namespace loadConfig {
	export type Context = { cwd: string }
}

type Context = loadConfig.Context

export async function loadConfig(context: loadConfig.Context) {
	return [
		[loadFromPackageJson(context), ...loadFromJson(context)].filter(Boolean) as Array<[string, unknown]>,
		loadConfigFromEnv()
	] as const
}

function loadFromPackageJson({ cwd }: Context): [string, any] | undefined {
	const filepath = path.resolve(cwd, 'package.json')
	if (fs.existsSync(filepath)) {
		const pjson = json.parse(fs.readFileSync(filepath, 'utf-8'))
		if (pjson.mocktomata) return ['package.json', pjson.mocktomata]
	}
	return undefined
}

function loadFromJson({ cwd }: Context): Array<[string, any] | undefined> {
	return ['mocktomata.json'].map(name => {
		const filepath = path.resolve(cwd, name)
		if (fs.existsSync(filepath)) {
			const json = json5.parse(fs.readFileSync(filepath, 'utf-8'))
			return [name, json]
		}
		return undefined
	})
}

export function loadConfigFromEnv() {
	return [
		'env',
		reduceOr([
			['overrideMode', process.env[MOCKTOMATA_MODE]],
			['logLevel', process.env[MOCKTOMATA_LOG_LEVEL]],
			['filePathFilter', process.env[MOCKTOMATA_FILE_PATH_FILTER]],
			['specNameFilter', process.env[MOCKTOMATA_SPEC_NAME_FILTER]]
		])
	] as const
}
