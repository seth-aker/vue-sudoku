
export class PuzzleSolverError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
    Object.setPrototypeOf(this, PuzzleSolverError.prototype)
  }
  formatError(): { message: string } {
    return { message: `[PuzzleSolver] ${this.message}` }
  }
}
