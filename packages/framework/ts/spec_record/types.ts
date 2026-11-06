import type { JSONTypes } from 'type-plus'

export type SpecRecord = {
	refs: SpecRecord.Reference[]
	actions: SpecRecord.Action[]
}

export namespace SpecRecord {
	/**
	 * Meta data.
	 * This is used during spying to save additional information,
	 * and use it during stubbing to reproduce the original behavior.
	 */
	export type Meta = JSONTypes | undefined
	export type Reference = {
		/**
		 * Name of the plugin
		 */
		plugin: string
		profile: SubjectProfile
		/**
		 * Meta data supplied by the plugin.
		 */
		meta?: Meta

		source?: ReferenceSource

		/**
		 * Indicates the value is inert.
		 * Inert value changes will not cause ActionMismatch error.
		 */
		inert?: boolean
	}
	export type ReferenceId = string

	export type ReferenceSource = PropertySource | ThisSource | ArgumentSource | ResultSource
	export type ArgumentSource = {
		type: 'argument'
		id: ActionId
		key: number
	}
	export type PropertySource = {
		type: 'property'
		id: ActionId
		key: ActionKey
	}

	export type ThisSource = {
		type: 'this'
		id: ActionId
	}

	export type ResultSource = {
		type: 'result'
		id: ActionId
	}

	/**
	 * This profile describes what kind of subject we are dealing with.
	 *
	 * - `target`: It's the spec subject. The `target` that we are simulating (`spec(target)`).
	 * - `input`: It's a subject that pass into the system from user
	 * - `output`: It's a subject that returns from the system (e.g. from the `target`)**
	 */
	export type SubjectProfile = 'target' | 'input' | 'output'

	export type Action = GetAction | SetAction | InvokeAction | InstantiateAction | ReturnAction | ThrowAction

	export type CauseActions = GetAction | SetAction | InvokeAction | InstantiateAction
	export type ResultActions = ReturnAction | ThrowAction
	export type Site = ThisSite | ResultSite | PropertySite
	export type ThisSite = { type: 'this' }
	export type PropertySite = {
		type: 'property'
		key: ActionKey
	}
	export type ResultSite = { type: 'result' }

	export type GetAction = {
		type: 'get'
		refId: ReferenceId
		performer: Performer
		tick: number
		key: ActionKey
	}

	export type SetAction = {
		type: 'set'
		refId: ReferenceId
		performer: Performer
		tick: number
		key: ActionKey
		/**
		 * Value of the set operation.
		 * This is the same as the set operation result,
		 * but that can be different if the set operation throws an error.
		 */
		value: any
	}

	export type InstantiateAction = {
		type: 'instantiate'
		refId: ReferenceId
		instanceId?: ReferenceId
		performer: Performer
		tick: number
		payload: any[]
		meta?: Meta
	}

	export type InvokeAction = {
		type: 'invoke'
		refId: ReferenceId
		performer: Performer
		tick: number
		thisArg: any
		payload: any[]
		site?: SiteKey
		// site?: Site,
		meta?: Meta
	}

	export type ReturnAction = {
		type: 'return'
		actionId: ActionId
		tick: number
		payload: any
	}

	export type ThrowAction = {
		type: 'throw'
		actionId: ActionId
		tick: number
		payload: any
	}

	export type ActionId = number

	export type Performer = 'user' | 'mockto' | 'plugin'

	/**
	 * Property key types a plugin can pass to `getProperty()` and `setProperty()`.
	 */
	export type SupportedKeyTypes = string | number | symbol

	/**
	 * Key of an invoke `site`.
	 * Symbol keys are not supported here.
	 */
	export type SiteKey = string | number

	/**
	 * A property key as saved in the record.
	 *
	 * String and number keys are saved as is.
	 * A symbol key is saved as a `SymbolKey`.
	 */
	export type ActionKey = string | number | SymbolKey

	/**
	 * A symbol property key as saved in the record.
	 *
	 * - `wellKnown`: a well-known symbol, such as `Symbol.iterator` (saved as `'iterator'`).
	 * - `key`: a registered symbol, `Symbol.for(key)`.
	 * - `unique`: a unique symbol, `Symbol(description)`.
	 *   It is numbered by the order it is first accessed in the spec.
	 */
	export type SymbolKey =
		| { type: 'symbol'; wellKnown: string }
		| { type: 'symbol'; key: string }
		| { type: 'symbol'; unique: number; description?: string }
}
