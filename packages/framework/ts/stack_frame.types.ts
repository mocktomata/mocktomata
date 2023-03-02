export type StackFrameContext = {
	stackFrame: {
		getCallerRelativePath(filepath?: string): string
	}
}
