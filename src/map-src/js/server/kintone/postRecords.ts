import { Hono } from 'hono';

const app = new Hono()

app.post('/kintone/postRecords', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('postRecords実行:', body);

    const url = `https://${body.domain}.cybozu.com/k/v1/records.json`;
    console.log('リクエストURL:', url);

    const postRecords = await fetch(url, {
      method: 'POST',
      headers: {
        "X-Cybozu-API-Token": body.token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body.records)
    })

    console.log('レスポンスステータス:', postRecords.status);

    if (!postRecords.ok) {
      const errorText = await postRecords.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`フィールドの取得に失敗しました。ステータス: ${postRecords.status}`)
    }

    const result = await postRecords.json();

    return c.json(result);
  } catch (error) {
    console.error('postRecordsエラー:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;
