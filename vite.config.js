import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';

export default defineConfig(async ({ mode }) => {
  console.log('ビルド開始');
  console.log(mode)
  // ビルドするターゲットを決定
  const isProdConfig = mode === 'production.config';
  const shouldObfuscate = process.env.OBFUSCATE !== '0';

  // 難読化の設定（Config 用: やや強め）
  const obfuscatorOptionsConfig = {
    compact: true,
    controlFlowFlattening: false, // パフォーマンスのため一旦無効化（必要なら後で有効化）
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: false, // パフォーマンスのため一旦無効化
    deadCodeInjectionThreshold: 0.2,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    selfDefending: false,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.4,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
  };

  // プラグイン配列を作成
  const plugins = [
    react({
      jsxRuntime: 'automatic',
    }),
  ];

  // 最終バンドルに対する後処理型の難読化）
  const createPostObfuscatePlugin = (targetFile, options) => ({
    name: 'post-obfuscate-bundle',
    apply: 'build',
    enforce: 'post',
    async generateBundle(_options, bundle) {
      try {
        for (const fileName of Object.keys(bundle)) {
          const chunk = bundle[fileName];
          if (chunk && chunk.type === 'chunk' && chunk.fileName === targetFile) {
            // 静的インポートへ変更
            const beforeSizeKB = (chunk.code.length / 1024).toFixed(1);
            const start = Date.now();
            const result = JavaScriptObfuscator.obfuscate(chunk.code, { ...options });
            chunk.code = result.getObfuscatedCode();
            const took = ((Date.now() - start) / 1000).toFixed(1);
            const afterSizeKB = (chunk.code.length / 1024).toFixed(1);
            console.log(
              `[post-obfuscate] ${targetFile} を難読化しました (size ${beforeSizeKB}KB -> ${afterSizeKB}KB, ${took}s)`
            );
          }
        }
      } catch (e) {
        console.error('[post-obfuscate] 難読化後処理でエラー:', e);
      }
    },
  });

  // 共通の設定
  const commonConfig = {
    plugins,
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    esbuild: {
      // Reactコンポーネント以外の圧縮を制限
      minifyIdentifiers: false, // 変数名・関数名の短縮化を無効化
      minifySyntax: true, // 構文の最適化は維持
      minifyWhitespace: true, // 空白の削除は維持
      target: 'es2022', // トップレベルawaitをサポート
    },
  };

  if (mode === 'map') {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist/map',
        emptyOutDir: false,
        target: 'es2022',
        lib: {
          entry: path.resolve(__dirname, 'src/map-src/js/map/index.js'),
          formats: ['es'],
          name: `map`,
          fileName: () => 'map.js',
        },
        rollupOptions: {
          plugins:
            isProdConfig && shouldObfuscate
              ? [createPostObfuscatePlugin('map.js', obfuscatorOptionsConfig)]
              : [],
          output: {
            extend: false,
            inlineDynamicImports: true,
            assetFileNames: (assetInfo) => {
              if (assetInfo.name.endsWith('.css')) {
                return 'map.css';
              }
              return 'assets/[name]-[hash][extname]';
            },
            preserveModules: false,
            minifyInternalExports: false,
          },
        },
      },
    }
  } else if (mode === 'config') {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist/map',
        emptyOutDir: false,
        target: 'es2022',
        lib: {
          entry: path.resolve(__dirname, 'src/map-src/js/config/config.mjs'),
          formats: ['es'],
          name: `config`,
          fileName: () => 'config.js',
        },
        rollupOptions: {
          plugins:
            isProdConfig && shouldObfuscate
              ? [createPostObfuscatePlugin('config.js', obfuscatorOptionsConfig)]
              : [],
          output: {
            extend: false,
            inlineDynamicImports: true,
            assetFileNames: (assetInfo) => {
              if (assetInfo.name.endsWith('.css')) {
                return 'config.css';
              }
              return 'assets/[name]-[hash][extname]';
            },
            preserveModules: false,
            minifyInternalExports: false,
          },
        }
      }
    }
  } else if (mode === 'login') {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist/map',
        emptyOutDir: false,
        target: 'es2022',
        lib: {
          entry: path.resolve(__dirname, 'src/map-src/js/login/login.mjs'),
          formats: ['es'],
          name: `login`,
          fileName: () => 'login.js',
        },
        rollupOptions: {
          plugins:
            isProdConfig && shouldObfuscate
              ? [createPostObfuscatePlugin('login.js', obfuscatorOptionsConfig)]
              : [],
          output: {
            extend: false,
            inlineDynamicImports: true,
            assetFileNames: (assetInfo) => {
              if (assetInfo.name.endsWith('.css')) {
                return 'login.css';
              }
              return 'assets/[name]-[hash][extname]';
            },
            preserveModules: false,
            minifyInternalExports: false,
          },
        },
      }
    }
  } else if (mode === 'detail') {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist/map',
        emptyOutDir: false,
        target: 'es2022',
        lib: {
          entry: path.resolve(__dirname, 'src/map-src/js/detail/detail.mjs'),
          formats: ['es'],
          name: `detail`,
          fileName: () => 'detail.js',
        },
        rollupOptions: {
          plugins:
            isProdConfig && shouldObfuscate
              ? [createPostObfuscatePlugin('detail.js', obfuscatorOptionsConfig)]
              : [],
          output: {
            extend: false,
            inlineDynamicImports: true,
            assetFileNames: (assetInfo) => {
              if (assetInfo.name.endsWith('.css')) {
                return 'detail.css';
              }
              return 'assets/[name]-[hash][extname]';
            },
            preserveModules: false,
            minifyInternalExports: false,
          },
        },
      }
    }
  }
});
