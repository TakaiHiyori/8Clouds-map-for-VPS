import { Hono } from 'hono';

const app = new Hono()

app.get('/kintone/getStatus', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    // const body = await c.req.json();
    const domain: string = c.req.query('domain');
    const app: string = c.req.query('appId');
    const token: string = c.req.query('token');
    console.log('getStatus実行:', domain, app, token);

    const url = `https://${domain}.cybozu.com/v1/app/status.json?app=${app}`;
    console.log('リクエストURL:', url);

    const getStatus = await fetch(url, {
      method: 'GET',
      headers: {
        "X-Cybozu-API-Token": token,
      }
    })

    console.log('レスポンスステータス:', getStatus.status);

    if (!getStatus.ok) {
      const errorText = await getStatus.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`フィールドの取得に失敗しました。ステータス: ${getStatus.status}`)
    }

    const result = await getStatus.json();

    return c.json(result);
  } catch (error) {
    console.error('getStatusエラー:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;
