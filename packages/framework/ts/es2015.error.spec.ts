import { a } from 'assertron'
import { ModuleError, SerializableConverter } from 'iso-error'
import plugin, { InvalidArgument } from 'iso-error-google-cloud-api'
import { BadRequest, HttpError } from 'iso-error-web'
import { isType } from 'type-plus'
import { incubator } from './incubator/index.js'

describe('error', () => {
	incubator('set error property', (specName, spec) => {
		it(specName, async () => {
			const s = await spec(() => {
				throw new Error('ha')
			})
			const err: any = a.throws(s)
			err.x = 1
			expect(err.x).toEqual(1)
			await spec.done()
		})
	})
	incubator('throw custom Error (cannot restore inheritance)', (specName, spec) => {
		test(specName, async () => {
			await spec(HttpError)
			const s = await spec(() => {
				throw new HttpError(424, 'pre cond')
			})
			const err = await a.throws(() => s(), HttpError)
			expect(err.status).toBe(424)
			await spec.done()
		})
	})
	incubator('throw custom Error with cause (cannot restore inheritance)', (specName, spec) => {
		test(specName, async () => {
			const converter = new SerializableConverter()
			converter.addPlugin(plugin)

			function request() {
				return Promise.reject({
					response: {
						data: {
							error: {
								code: 3,
								details: [{ '@type': 'google-cloud-api/CauseInfo', causes: [], message: 'not found' }],
								message: 'not found'
							}
						}
					}
				})
			}

			const s = await spec(request)
			const err = await a.throws<ModuleError>(
				s().then(undefined, e => {
					const options: any = {}
					if (e.response) {
						if (
							isType<{ error: Record<any, any> }>(
								e.response.data,
								d => typeof d === 'object' && typeof d.error === 'object'
							)
						) {
							options.cause = converter.fromSerializable(e.response.data.error, { ssf: request })
						}
						throw new BadRequest('bad request', options)
					}
				})
			)
			expect(err.name).toEqual(BadRequest.name)
			expect(err.cause?.name).toEqual(InvalidArgument.name)
			// expect(err.cause?.message).toBe('not found')
			expect(err.module).toBe('iso-error-http')
			await spec.done()
		})
	})
})
