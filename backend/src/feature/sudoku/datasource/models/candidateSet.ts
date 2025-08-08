export class CandidateSet extends Set<number> {
  constructor() {
    super()
  }
  toJSON() {
    return [...this]
  }
}
