#!/usr/bin/env node
import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const targets = [
  { name: 'map', entry: 'src/map-src/js/map/index.js', fileName: 'map.js' },
  { name: 'config', entry: 'src/map-src/js/config/config.mjs', fileName: 'config.js' },
  { name: 'login', entry: 'src/map-src/js/login/login.mjs', fileName: 'login.js' },
  { name: 'detail', entry: 'src/map-src/js/detail/detail.mjs', fileName: 'detail.js' },
];

async function buildAll() {
  console.log('複数ビルドを順序に実行します...\n');

  for (const target of targets) {
    console.log(`\n========== ビルド開始: ${target.name} ==========`);

    try {
      // 環境変数を設定
      process.env.BUILD_TARGET = target.name;

      // Viteをプログラマティックに実行
      const config = (await import(path.resolve(__dirname, 'vite.config.js'))).default;
      const resolvedConfig = await (typeof config === 'function' ? config({ mode: 'production', command: 'build' }) : config);

      await build(resolvedConfig);

      console.log(`✓ ${target.name} ビルド完了`);
    } catch (error) {
      console.error(`✗ ${target.name} ビルド失敗:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n========== すべてのビルド完了 ==========');
  console.log('生成されたファイル:');
  targets.forEach(target => {
    console.log(`  - dist/map/${target.fileName}`);
    console.log(`  - dist/map/${target.name}.css`);
  });
}

buildAll().catch(error => {
  console.error('ビルドエラー:', error);
  process.exit(1);
});
