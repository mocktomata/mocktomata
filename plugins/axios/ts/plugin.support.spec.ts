import axios from 'axios'
import { plugin } from './plugin.js'

it('supprots axios top instance', () => {
	expect(plugin.support(axios)).toBe(true)
})

it('supports axios instance from axios.create()', ()=> {
	const s = axios.create()
	expect(plugin.support(s)).toBe(true)
})
