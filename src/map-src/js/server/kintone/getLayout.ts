import { Hono } from 'hono';

const app = new Hono()

app.post('/kintone/getLayout', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('getLayout実行:', body);

    const url = `https://${body.domain}.cybozu.com/k/v1/app/form/layout.json?app=${body.app}`;
    console.log('リクエストURL:', url);

    const getLayout = await fetch(url, {
      method: 'GET',
      headers: {
        "X-Cybozu-API-Token": body.token,
        // "Content-Type": "application/json"
      }
    })

    console.log('レスポンスステータス:', getLayout.status);

    if (!getLayout.ok) {
      const errorText = await getLayout.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`フィールドの取得に失敗しました。ステータス: ${getLayout.status}`)
    }

    const result = await getLayout.json();

    return c.json(result);
  } catch (error) {
    console.error('getLayoutエラー:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;
