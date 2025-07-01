export interface SudokuRules {
    diagonalPositive?: boolean, // diagonal along puzzle as x and y increase
    diagonalNegative?: boolean, // diagonal along the puzzle as x increases and y decreases
    knightsMove?: boolean, // cells that are a chess knight's move apart cannot be the same
    kingsMove?: boolean, // cells that are a chess king's move apart cannot be the same
    disjointGroups?: boolean // cells that are in the same relative position of their blocks cannot be the same
}