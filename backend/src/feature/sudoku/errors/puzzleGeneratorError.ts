export class PuzzleSolverError extends Error {
  constructor(message: string) {
    super();
    this.message = `[PuzzleGenerator] ${message}`;
    Object.setPrototypeOf(this, PuzzleSolverError.prototype)
  }
}
