export class MissingClauseHandler extends Error {
  constructor(public clause: string) {
    super(`Handler for ${clause} not found.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
