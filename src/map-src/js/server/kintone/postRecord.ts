import { Hono } from 'hono';

const app = new Hono()

app.post('/kintone/postRecord', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('postRecord実行:', body);

    const url = `https://${body.domain}.cybozu.com/k/v1/record.json`;
    console.log('リクエストURL:', url);

    const postRecord = await fetch(url, {
      method: 'POST',
      headers: {
        "X-Cybozu-API-Token": body.token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body.record)
    })

    console.log('レスポンスステータス:', postRecord.status);

    if (!postRecord.ok) {
      const errorText = await postRecord.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`フィールドの取得に失敗しました。ステータス: ${postRecord.status}`)
    }

    const result = await postRecord.json();

    return c.json(result);
  } catch (error) {
    console.error('postRecordエラー:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;
