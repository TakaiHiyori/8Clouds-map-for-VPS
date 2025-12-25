import { Hono } from 'hono';

const app = new Hono()

app.post('/kintone/getFile', async (c) => {
  c.header('Content-Type', 'application/json;');
  try {
    const body = await c.req.json();
    console.log('getFile実行:', body);

    const getUrl = `https://${body.domain}.cybozu.com/k/v1/file.json?fileKey=${body.fileKey}`;
    console.log('リクエストURL:', getUrl);

    const getFile = await fetch(getUrl, {
      method: 'GET',
      headers: {
        "X-Cybozu-API-Token": body.token,
        'X-Requested-With': 'XMLHttpRequest',
        // 'X-Requested-With': 'XMLHttpRequest',
      }
    })

    console.log('レスポンスステータス:', getFile.status);

    if (!getFile.ok) {
      const errorText = await getFile.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`フィールドの取得に失敗しました。ステータス: ${getFile.status}`)
    }

    const blob = await getFile.blob();

    // BlobをバッファにしてBase64エンコード
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    return c.json({
      success: true,
      data: base64,
      mimeType: blob.type
    });
  } catch (error) {
    console.error('getFileエラー:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;
