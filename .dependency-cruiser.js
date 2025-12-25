
/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'warn',
      comment: 'index.js以外のファイルでの循環依存が検出されました。',
      from: {
        pathNot: ['/index\\.js$'], // index.jsファイルを除外
      },
      to: {
        circular: true,
      },
    },
    {
      name: 'barrel-circular',
      severity: 'info', // 警告ではなく情報レベルに変更
      comment: 'バレルファイル(index.js)での循環依存が検出されました。一般的には問題ありません。',
      from: {
        path: ['/index\\.js$'], // index.jsファイルのみ対象
      },
      to: {
        circular: true,
      },
    },
    {
      name: 'barrel-circular-extended',
      severity: 'info',
      comment: 'バレルファイルを介した循環参照も許容',
      from: {},
      to: {
        circular: true,
        path: ['.*index\\.js.*'],
      },
    },

    {
      name: 'no-orphans',
      severity: 'info',
      comment: 'このファイルは依存関係を持っていません。',
      from: {
        orphan: true,
        pathNot: ['node_modules', 'dist', '\\.(json|css|scss|html|jpg|png|svg)$'],
      },
      to: {},
    },
    {
      name: 'no-deprecated-core',
      severity: 'warn',
      comment: 'このファイルは非推奨のコアモジュールを使用しています。',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: ['^(punycode|domain)$'],
      },
    },
    {
      name: 'no-deprecated',
      severity: 'warn',
      comment: 'このファイルは非推奨のnpmモジュールに依存しています。',
      from: {},
      to: {
        dependencyTypes: ['deprecated'],
      },
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      comment: 'このモジュールは解決できないモジュールに依存しています。',
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
  ],
  options: {
    doNotFollow: {
      path: ['node_modules', 'test', 'tests', '.*\\.test\\.js$', '.*\\.spec\\.js$'],
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],

    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
        theme: {
          graph: {
            splines: 'ortho',
            rankdir: 'TD',
          },
          modules: [
            {
              criteria: { source: '^src/js' },
              attributes: { fillcolor: '#ccffcc' },
            },
          ],
          dependencies: [
            {
              criteria: { circular: true },
              attributes: { color: '#ff0000', fontcolor: '#ff0000' },
            },
            {
              criteria: { circular: true, from: { path: '/index\\.js$' } },
              attributes: { color: '#ffa500', fontcolor: '#ffa500', style: 'dashed' }, // オレンジ色で表示
            },
          ],
        },
      },
      archi: {
        collapsePattern: ['^src/js/[^/]+', 'node_modules/[^/]+'],
      },
    },
  },
};
