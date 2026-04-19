import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  minify: true,
  treeshake: true, // Enable tree-shaking for dead code
  splitting: false,
  sourcemap: false,
  clean: true,
  // Preserve all exports even if not used internally
  external: [],
});
