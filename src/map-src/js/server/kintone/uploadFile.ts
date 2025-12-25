import { Hono } from 'hono';

const app = new Hono()

app.post('/kintone/uploadFile', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    // FormDataを取得
    const formData = await c.req.formData();
    const domain = formData.get('domain') as string;
    const token = formData.get('token') as string;
    const file = formData.get('file') as File;

    console.log('uploadFile実行:', { domain, token, fileName: file.name });

    const url = `https://${domain}.cybozu.com/k/v1/file.json`;
    console.log('リクエストURL:', url);

    // Kintoneへのアップロード用のFormDataを作成
    const kintoneFormData = new FormData();
    kintoneFormData.append('file', file);

    const uploadFile = await fetch(url, {
      method: 'POST',
      headers: {
        "X-Cybozu-API-Token": token,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: kintoneFormData
    })

    console.log('レスポンスステータス:', uploadFile.status);

    if (!uploadFile.ok) {
      const errorText = await uploadFile.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`ファイルのアップロードに失敗しました。ステータス: ${uploadFile.status}`)
    }

    const result = await uploadFile.json();
    console.log('アップロード成功:', result);

    return c.json({
      success: true,
      fileKey: result.fileKey
    });
  } catch (error) {
    console.error('uploadFileエラー:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;
