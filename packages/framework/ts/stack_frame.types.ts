export type StackFrameContext = {
	stackFrame: {
		getCallSites(skipFrames?: number): string[]
		getCallerRelativePath(subject: (...args: any[]) => any): string
	}
}
