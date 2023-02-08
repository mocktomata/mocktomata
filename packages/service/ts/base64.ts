export function atob(data: string) {
	return Buffer.from(data, 'base64').toString('ascii')
}

export function btoa(data: string) {
	return Buffer.from(data).toString('base64')
}
