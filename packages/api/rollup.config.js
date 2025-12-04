// rollup.config.js
import { readFileSync, existsSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve as resolvePath } from 'path';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

/**
 * Check if we're in development mode
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Resolve ~ alias to actual file path with extension
 */
const resolveAlias = (id) => {
  if (!id.startsWith('~')) {
    return null;
  }
  
  const pathAfterTilde = id.replace(/^~\/?/, '');
  const basePath = resolvePath(__dirname, 'src', pathAfterTilde);
  
  // Try with .ts extension first
  const tsPath = basePath + '.ts';
  if (existsSync(tsPath)) {
    return tsPath;
  }
  
  // Try as directory with index.ts
  if (existsSync(basePath) && statSync(basePath).isDirectory()) {
    const indexPath = resolvePath(basePath, 'index.ts');
    if (existsSync(indexPath)) {
      return indexPath;
    }
  }
  
  // Fallback: return base path (let other plugins handle it)
  return basePath;
};

const plugins = [
  peerDepsExternal(),
  alias({
    entries: [
      { find: '~', replacement: resolvePath(__dirname, 'src') }
    ]
  }),
  resolve({
    preferBuiltins: true,
    skipSelf: true,
    extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
  }),
  typescript({
    tsconfig: './tsconfig.build.json',
    outDir: './dist',
    sourceMap: true,
    /**
     * Remove inline sourcemaps - they conflict with external sourcemaps
     */
    inlineSourceMap: false,
    /**
     * Always include source content in sourcemaps for better debugging
     */
    inlineSources: true,
  }),
  replace({
    __IS_DEV__: isDevelopment,
    preventAssignment: true,
  }),
  commonjs({
    transformMixedEsModules: true,
    requireReturnsDefault: 'auto',
  }),
  json(),
];

const cjsBuild = {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true,
    exports: 'named',
    entryFileNames: '[name].js',
    /**
     * Always include sources in sourcemap for better debugging
     */
    sourcemapExcludeSources: false,
  },
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})],
  preserveSymlinks: true,
  plugins,
};

export default cjsBuild;
