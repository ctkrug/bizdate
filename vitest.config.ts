import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      // site/src/ledger.ts is the one piece of the playground that's pure
      // logic (not DOM wiring), so it's tracked alongside the library.
      include: ['src/**', 'site/src/ledger.ts'],
      exclude: ['src/**/index.ts', 'src/types.ts'],
    },
  },
});
