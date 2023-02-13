import { fetch } from 'cross-fetch'
import { mockto } from 'mocktomata'

mockto('find kidnap worthy breed', (specName, spec) => {
	it(specName, async () => {
		const f = await spec(fetch)
		const r = await f('https://api.thecatapi.com/v1/breeds?limit=10')
		const breeds: any[] = await r.json()
		const dumbest = breeds.sort((a, b) => a.intelligence - b.intelligence)[0]
		expect(dumbest.intelligence).toEqual(3)
		await spec.done()
	})
})
