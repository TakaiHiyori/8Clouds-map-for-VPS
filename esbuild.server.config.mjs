// esbuild.server.config.mjs
import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entryFile = path.resolve(__dirname, 'src/index.ts');

const commonOptions = {
  entryPoints: [entryFile],
  bundle: true,
  platform: 'node', // Node.js 用
  target: ['esnext'], // top-level await 対応ブラウザ
  outfile: path.resolve(__dirname, 'dist/benri-map-test-index.js'),
  sourcemap: false,
  minify: false,
  logLevel: 'info',
  // dotenv や minio などは普通にバンドル対象
  external: [], // もし外出ししたいモジュールがあれば追加
};

async function run() {
  try {
    await build(commonOptions);
    // await build(commonServerOptions);
    console.log('Server bundle built -> dist/benri-map-test-index.js');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

run();
