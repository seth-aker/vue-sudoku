import { z } from 'zod';

/** Mirrors the web app's register validation rules. */
const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;

export const usernameSchema = z
  .string()
  .min(4, 'Username must be 4 or more characters');

export const passwordSchema = z
  .string()
  .regex(
    passwordRegex,
    'Password needs 8+ chars with upper, lower, number, and a special character',
  );

export const validateUsername = (v: string): string | undefined =>
  usernameSchema.safeParse(v).success
    ? undefined
    : 'Username must be 4 or more characters';

export const validatePassword = (v: string): string | undefined =>
  passwordSchema.safeParse(v).success
    ? undefined
    : 'Password needs 8+ chars with upper, lower, number, and a special character';
