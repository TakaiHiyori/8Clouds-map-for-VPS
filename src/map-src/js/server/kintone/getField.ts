import { Hono } from 'hono';

const app = new Hono()

app.post('/kintone/getField', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('getField実行:', body);

    const url = `https://${body.domain}.cybozu.com/k/v1/app/form/fields.json?app=${body.app}`;
    console.log('リクエストURL:', url);

    const getField = await fetch(url, {
      method: 'GET',
      headers: {
        "X-Cybozu-API-Token": body.token,
        // "Content-Type": "application/json"
      }
    })

    console.log('レスポンスステータス:', getField.status);

    if (!getField.ok) {
      const errorText = await getField.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`フィールドの取得に失敗しました。ステータス: ${getField.status}`)
    }

    const result = await getField.json();

    return c.json(result);
  } catch (error) {
    console.error('getFieldエラー:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;
