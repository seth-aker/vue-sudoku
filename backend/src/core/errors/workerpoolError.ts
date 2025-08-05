export class WorkerPoolError extends Error {
  constructor(message: string) {
    super()
    this.message = message;
    Object.setPrototypeOf(this, WorkerPoolError.prototype)
  }
}
