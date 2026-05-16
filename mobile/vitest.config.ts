import { defineConfig } from 'vitest/config';

/**
 * Vitest covers the pure, framework-agnostic domain logic only. The `test`
 * script pins `--root .` and `--dir src/domain` so the sibling Vue `frontend/`
 * test files are never collected.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
  },
});
