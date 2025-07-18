import z from "zod/v4";

export const difficultySchema = z.enum(['easy', 'medium', 'hard', 'impossible'], 'Invalid difficulty')
