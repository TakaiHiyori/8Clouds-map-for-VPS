import { Hono } from 'hono';

const app = new Hono()

app.post('/kintone/getNewRecords', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('getNewRecords実行:', body);

    const url = `https://${body.domain}.cybozu.com/k/v1/records.json?app=${body.body.app}&query=${body.body.query}`;
    console.log('リクエストURL:', url);

    const getNewRecords = await fetch(url, {
      method: 'GET',
      headers: {
        "X-Cybozu-API-Token": body.token,
        // "Content-Type": "application/json"
      }
    })

    console.log('レスポンスステータス:', getNewRecords.status);

    if (!getNewRecords.ok) {
      const errorText = await getNewRecords.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`フィールドの取得に失敗しました。ステータス: ${getNewRecords.status}`)
    }

    const result = await getNewRecords.json();

    return c.json(result);
  } catch (error) {
    console.error('getNewRecordsエラー:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;
