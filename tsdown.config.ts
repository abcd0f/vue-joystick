import { defineConfig } from 'tsdown';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  entry: ['src/index.ts'],

  format: ['esm', 'cjs'],

  outDir: 'dist',

  dts: false,

  clean: true,

  sourcemap: false,

  unbundle: false,

  treeshake: true,

  plugins: [vue()],

  minify: true,

  deps: {
    neverBundle: ['vue']
  }
});
