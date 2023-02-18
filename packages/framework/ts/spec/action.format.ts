// ignore coverage because not going to write test just for enable log with all different action types
// istanbul ignore file
import { tersify } from 'tersify'
import { notDefined } from '../constants.js'
import type { SpecRecord } from '../spec-record/types.js'

export namespace prettifyAction {
	export type Options = OptionsForGetInvoke | OptionsForReturnThrow
	export type OptionsForGetInvoke = {
		actionId: SpecRecord.ActionId
		action: SpecRecord.GetAction | SpecRecord.InvokeAction
	}
	export type OptionsForReturnThrow = {
		actionId: SpecRecord.ActionId
		action: SpecRecord.ReturnAction | SpecRecord.ThrowAction
		sourceId: SpecRecord.ActionId
	}
	export type State = {
		ref: { plugin: string }
		refId: SpecRecord.ReferenceId
		source?: SpecRecord.ReferenceSource
	}
}

export function prettifyAction(
	state: prettifyAction.State,
	actionId: SpecRecord.ActionId,
	action: SpecRecord.Action
) {
	switch (action.type) {
		case 'get':
			return `${state.ref.plugin} <act:${actionId}> ${prettifyPerformer(action.performer)} access <ref:${
				state.refId
			}>.${action.key}`
		case 'set':
			return `${state.ref.plugin} <act:${actionId}> ${prettifyPerformer(action.performer)} set <ref:${
				state.refId
			}>.${action.key} = ${tersifyValue(action.value)}`
		case 'invoke': {
			const argsStr = action.payload.length === 0 ? '' : `, ${action.payload.map(tersifyValue).join(', ')}`
			return `${state.ref.plugin} <act:${actionId}> ${prettifyPerformer(action.performer)} invoke <ref:${
				state.refId
			}>${action.site ? `.${action.site}` : ''}(this:${tersifyValue(action.thisArg)}${argsStr})`
		}
		case 'instantiate': {
			const argsStr = action.payload.map(tersifyValue).join(', ')
			return `${state.ref.plugin} <act:${actionId}> ${prettifyPerformer(action.performer)} instantiate <ref:${
				state.refId
			}>(${argsStr})`
		}
		case 'return':
			return `${state.ref.plugin} <act:${actionId}> ${prettifyIdWithRef(state.refId, state.source?.id)} -> ${
				typeof action.payload === 'string' ? `<ref:${action.payload}>` : tersify(action.payload)
			}`
		case 'throw':
			return `${state.ref.plugin} <act:${actionId}> ${prettifyIdWithRef(
				state.refId,
				state.source?.id
			)} throws ${typeof action.payload === 'string' ? `<ref:${action.payload}>` : tersify(action.payload)}`
	}
}

function prettifyIdWithRef(
	refId: SpecRecord.ReferenceId,
	id: SpecRecord.ReferenceId | SpecRecord.ActionId | undefined
) {
	return id !== undefined ? (typeof id === 'string' ? `<ref:${id}>` : `<ref:${refId} act:${id}>`) : ''
}

function prettifyPerformer(performer: SpecRecord.Performer) {
	switch (performer) {
		case 'user':
			return 'you'
		case 'mockto':
			return 'I'
		default:
			return performer
	}
}

function tersifyValue(value: any) {
	return typeof value === 'string' ? `<ref:${value}>` : value === notDefined ? `<unknown>` : value
}
