import { Hono } from 'hono';

const app = new Hono()

app.post('/kintone/putRecord', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('putRecord実行:', body);

    const url = `https://${body.domain}.cybozu.com/k/v1/record.json`;
    console.log('リクエストURL:', url);

    const potRecord = await fetch(url, {
      method: 'PUT',
      headers: {
        "X-Cybozu-API-Token": body.token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body.record)
    })

    console.log('レスポンスステータス:', potRecord.status);

    if (!potRecord.ok) {
      const errorText = await potRecord.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`フィールドの取得に失敗しました。ステータス: ${potRecord.status}`)
    }

    const result = await potRecord.json();

    return c.json(result);
  } catch (error) {
    console.error('putRecordエラー:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;
