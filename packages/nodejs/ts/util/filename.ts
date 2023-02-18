import { MocktomataError } from '@mocktomata/framework'
import sanitize from 'sanitize-filename'

/**
 * Tested in Windows 11 the folder path length limit is 248:
 * `D:\a-very-long-folder-name-right-now-it-is-still-growing\a-very-long-folder-name-right-now-it-is-still-growing\a-very-long-folder-name-right-now-it-is-still-growing\a-very-long-folder-name-right-now-it-is-still-growing\a-very-long-folder-name-righ`
 * `D:\一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十\一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十\一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十\一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十\一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十`
 *
 * Setting the limit to a smaller value to give space for generating the file
 */
const baseDirLenLimit = 240

const filenameLenLimit = 80

export function genFilename(baseDir: string, id: string, dupId = 0) {
	// istanbul ignore next
	if (process.platform === 'win32' && baseDir.length > baseDirLenLimit)
		throw new MocktomataError(
			'the project is too deep in the folder to use Mocktomata. Please move the project closer to root.'
		)

	const dupIdLen = dupId ? String(dupId).length : 0
	const lenLimit = Math.min(filenameLenLimit, baseDirLenLimit - baseDir.length) - dupIdLen

	if (!id) id = 'empty'
	const f = sanitize(id).replace(/\s/g, '-')

	if (f.length > lenLimit - dupIdLen) {
		return dupIdLen
			? `${f.slice(0, lenLimit - dupIdLen - 3)}...${dupId}`
			: `${f.slice(0, lenLimit - dupIdLen - 3)}...`
	}
	return dupIdLen ? `${f}${dupId}` : f
}
