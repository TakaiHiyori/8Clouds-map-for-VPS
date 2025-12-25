import { Hono } from 'hono';

const app = new Hono()

app.post('/kintone/getRecord', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('getRecord実行:', body);

    const url = `https://${body.domain}.cybozu.com/k/v1/record.json?app=${body.app}&id=${body.id}`;
    console.log('リクエストURL:', url);

    const getRecord = await fetch(url, {
      method: 'GET',
      headers: {
        "X-Cybozu-API-Token": body.token,
        // "Content-Type": "application/json"
      }
    })

    console.log('レスポンスステータス:', getRecord.status);

    if (!getRecord.ok) {
      const errorText = await getRecord.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`フィールドの取得に失敗しました。ステータス: ${getRecord.status}`)
    }

    const result = await getRecord.json();

    return c.json(result);
  } catch (error) {
    console.error('getRecordエラー:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;
