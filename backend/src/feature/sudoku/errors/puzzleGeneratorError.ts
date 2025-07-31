export class PuzzleGeneratorError extends Error {
  constructor(message: string) {
    super();
    this.message = `[PuzzleGenerator] ${message}`;
    Object.setPrototypeOf(this, PuzzleGeneratorError.prototype)
  }
}
