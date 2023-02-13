import type { AsyncContext } from 'async-fp'
import type { PartialPick } from 'type-plus'
import { notDefined } from '../constants.js'
import { findPlugin, getPlugin } from '../spec-plugin/findPlugin.js'
import type { SpecPlugin } from '../spec-plugin/types.js'
import type { SpecRecord } from '../spec-record/types.js'
import { createTimeTracker, TimeTracker } from '../timeTracker/index.js'
import {
	getArgumentContext,
	getPropertyContext,
	getResultContext,
	getThisContext
} from '../utils-internal/index.js'
import { logAction, logCreateSpy, logRecordingTimeout } from './logs.js'
import { createSpecRecordBuilder } from './record.js'
import { getDefaultPerformer } from './subjectProfile.js'
import type { createSpec, MaskCriterion, Recorder, SpecRecordLive } from './types.internal.js'
import type { Spec } from './types.js'

export function createRecorder(
	context: AsyncContext<createSpec.Context>,
	specName: string,
	options: Spec.Options
) {
	let timeTracker: TimeTracker
	const ctx = context.extend(async ({ timeTrackers, log }) => {
		timeTracker = createTimeTracker({ log }, options, elapsed =>
			logRecordingTimeout({ log }, specName, elapsed)
		)
		timeTrackers.push(timeTracker)
		return { timeTracker }
	})

	const record = createSpecRecordBuilder(specName)

	let c: Promise<PartialPick<Recorder.Context, 'state'>>
	async function getContext() {
		if (c) return c
		return (c = ctx.extend(() => ({ record, spyOptions: [] })).get())
	}
	return {
		createSpy: <S>(subject: S) =>
			getContext().then(ctx => {
				const ref = ctx.record.findRef(subject) ?? createSpyRef(ctx, subject, { profile: 'target' })
				return ref?.testDouble
			}),
		end: () => timeTracker?.stop(),
		getSpecRecord: (maskValues: MaskCriterion[]) => record.getSpecRecord(maskValues),
		addInertValue: (subject: any) =>
			getContext().then(ctx =>
				ctx.spyOptions.push({ subject, options: { plugin: '@mocktomata/inert', inert: true } })
			),
		addMaskValue: (value: string | RegExp, replaceWith?: string) =>
			getContext().then(({ maskCriteria }) => maskCriteria.push({ value, replaceWith }))
	}
}

function createSpyRef<S>(
	context: PartialPick<Recorder.Context, 'state'>,
	subject: S,
	options: { profile: SpecRecord.SubjectProfile }
) {
	const spyOption = context.spyOptions.find(o => o.subject === subject)
	const plugin = spyOption?.options.plugin
		? getPlugin(context.plugins, spyOption.options.plugin)
		: findPlugin(context.plugins, subject)
	// this is a valid case because there will be new feature in JavaScript that existing plugin will not support
	// istanbul ignore next
	if (!plugin) {
		context.log.warn(`Unable to locate a plugin:`, subject)
		return undefined
	}

	const profile = options.profile

	// Possible sources:
	// spec subject: undefined
	// getProperty on object/function/class/instance.promise: { actionId: getId, site: [propertyName] }
	// getProperty on complex plugin: { actionId: getId, site: [...propPath] }
	// invoke argument: { actionId: invokeId, site: [argIndex] }
	// invoke return: { actionId: returnId }
	// invoke throw: { actionId: throwId }
	// instantiate argument: { actionId: instantiateId, site: [argIndex] }
	// getSpyId from array: no source
	const source = context.state?.source
	const ref: SpecRecordLive.Reference = {
		plugin: plugin.name,
		profile,
		overrideProfiles: [],
		subject,
		testDouble: notDefined,
		source
	}
	if (spyOption?.options.inert) ref.inert = true
	const refId = context.record.addRef(ref)
	const state = { ref, refId }
	logCreateSpy(context, state, profile, subject)
	ref.testDouble = plugin.createSpy(createPluginSpyContext({ ...context, state }), subject)
	return ref
}

export function createPluginSpyContext(context: Recorder.Context): SpecPlugin.SpyContext<any> {
	return {
		setSpyOptions: (subject, options) => context.spyOptions.push({ subject, options }),
		setMeta(meta) {
			return (context.state.ref.meta = meta)
		},
		getSpy(value) {
			return getSpy(context, value, {})
		},
		getSpyId(value) {
			const { record } = context
			const spy = getSpy(context, value, {})
			return record.findRefId(spy) || value
		},
		getProperty({ key, performer }, handler) {
			const { record, timeTracker, state } = context
			const action: SpecRecord.GetAction = {
				type: 'get',
				refId: state.refId,
				performer: performer || getDefaultPerformer(state.ref.profile),
				tick: timeTracker.elapse(),
				key
			}
			const actionId = record.addAction(action)
			logAction(context, context.state, actionId, action)
			return handleResult(context, actionId, action.type, handler)
		},
		setProperty({ key, performer, value }, handler) {
			const { record, timeTracker, state } = context
			const action: SpecRecord.SetAction = {
				type: 'set',
				refId: state.refId,
				performer: performer || getDefaultPerformer(state.ref.profile),
				tick: timeTracker.elapse(),
				key,
				value: notDefined
			}

			const actionId = record.addAction(action)

			handleResult(context, actionId, action.type, () => {
				const spiedValue = getSpy(getPropertyContext(context, actionId, key), value, {
					profile: getSubjectProfile(state.ref.profile)
				})
				action.value = record.findRefId(spiedValue) || value
				logAction(context, context.state, actionId, action)
				return handler(spiedValue)
			})
			return true
		},
		invoke({ thisArg, args, performer, site }, handler) {
			const { record, state, timeTracker } = context
			const action: SpecRecord.InvokeAction = {
				type: 'invoke',
				refId: state.refId,
				performer: performer || getDefaultPerformer(state.ref.profile),
				site,
				thisArg: notDefined,
				payload: [],
				tick: timeTracker.elapse()
			}
			const actionId = record.addAction(action)

			return handleResult(context, actionId, action.type, () => {
				const spiedThisArg = getSpy(getThisContext(context, actionId), thisArg, {
					profile: getSubjectProfile(state.ref.profile)
				})
				action.thisArg = record.findRefId(spiedThisArg)!

				const spiedArgs = args.map((arg, key) => {
					const spiedArg = getSpy(getArgumentContext(context, actionId, key), arg, {
						profile: getSubjectProfile(state.ref.profile)
					})
					action.payload.push(record.findRefId(spiedArg) ?? arg)
					return spiedArg
				}) as typeof args
				logAction(context, context.state, actionId, action)
				return handler({ thisArg: spiedThisArg, args: spiedArgs })
			})
		},
		instantiate({ args, performer }, handler) {
			const { record, state, timeTracker } = context
			performer = performer || getDefaultPerformer(state.ref.profile)

			const action: SpecRecord.InstantiateAction = {
				type: 'instantiate',
				refId: state.refId,
				performer,
				payload: [],
				tick: timeTracker.elapse()
			}
			const actionId = record.addAction(action)

			return handleResult(context, actionId, action.type, () => {
				const spiedArgs = args.map((arg, key) => {
					const spiedArg = getSpy(getArgumentContext(context, actionId, key), arg, {
						profile: getSubjectProfile(state.ref.profile)
					})
					action.payload.push(record.findRefId(spiedArg) || arg)
					return spiedArg
				}) as typeof args
				logAction(context, context.state, actionId, action)
				return handler({ args: spiedArgs })
			})
		}
	}
}

export function getSpy<S>(
	context: Recorder.Context,
	subject: S,
	options: {
		/**
		 * if true, the subject should go through masking
		 */
		mask?: boolean
		profile?: SpecRecord.SubjectProfile
	}
): S {
	const { record, state } = context

	const ref = record.findRef(subject)
	if (ref) {
		// subject already have a ref.
		// e.g. when an input spy is being returned in a function call
		if (ref.testDouble === notDefined) {
			const plugin = getPlugin(context.plugins, ref.plugin)
			ref.testDouble = plugin.createSpy(
				createPluginSpyContext({ ...context, state: { ...state, source: undefined } }),
				ref.subject
			)
		}
		return ref.testDouble
	}
	const profile = options.profile || state.ref.profile
	const spyRef = createSpyRef(context, subject, { profile })
	return spyRef?.testDouble || subject
}

function handleResult(
	context: Recorder.Context,
	actionId: SpecRecord.ActionId,
	actionType: SpecRecord.CauseActions['type'],
	handler: () => any
) {
	try {
		return addResultAction(context, actionId, actionType, 'return', handler())
	} catch (e: any) {
		throw addResultAction(context, actionId, actionType, 'throw', e)
	}
}
function addResultAction(
	context: Recorder.Context,
	actionId: SpecRecord.ActionId,
	actionType: SpecRecord.CauseActions['type'],
	type: 'return' | 'throw',
	subject: any
) {
	const { record, timeTracker } = context
	const action = { type, actionId, tick: timeTracker.elapse(), payload: notDefined }
	const id = record.addAction(action)
	const resultContext = getResultContext(context, actionId)
	const spy = getSpy(resultContext, subject, {
		mask: true,
		profile: getResultProfile(context.state.ref.profile, actionType)
	})
	const refId = record.findRefId(spy)
	action.payload = refId !== undefined ? refId : subject
	logAction(resultContext, resultContext.state, id, action)
	return spy
}

function getSubjectProfile(parentProfile: SpecRecord.SubjectProfile): SpecRecord.SubjectProfile {
	switch (parentProfile) {
		case 'target':
			return 'input'
		case 'input':
			return 'output'
		case 'output':
			return 'input'
	}
}

function getResultProfile(
	parentProfile: SpecRecord.SubjectProfile,
	actionType: SpecRecord.CauseActions['type']
): SpecRecord.SubjectProfile {
	switch (parentProfile) {
		case 'target':
			return actionType === 'get' ? 'target' : 'output'
		case 'input':
			return 'input'
		case 'output':
			return 'output'
	}
}
