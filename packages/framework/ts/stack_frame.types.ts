export type StackFrameContext = {
	stackFrame: {
		getCallerRelativePath(subject: (...args: any[]) => any): string
	}
}
