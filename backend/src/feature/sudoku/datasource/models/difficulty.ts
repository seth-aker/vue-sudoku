import { z } from "zod/v4";

export type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';

export const difficultySchema = z.enum(['easy', 'medium', 'hard', 'impossible'], 'Invalid difficulty')