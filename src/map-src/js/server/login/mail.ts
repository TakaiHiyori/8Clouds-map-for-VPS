
import { Hono } from 'hono';
import { randomInt } from 'node:crypto';
import pool from '../db';

const app = new Hono()

app.post('/mail', async (c) => {
  c.header('Content-Type', 'application/json');
  try {
    const body = await c.req.json();

    const getUrl = `https://script.google.com/macros/s/AKfycbweLsCohZ_IjTb6XLPlkZGzsFOXicFDQVkf4nZ9m4fiJNd2Olio6-aAWD5cDfWGsy3W1Q/exec`;
    console.log('body:', body);

    // 既存の認証コードを無効化
    await pool.query(
      `UPDATE benri_map.auth_codes 
       SET is_used = true
       WHERE benri_map_user_id = $1 AND email = $2 AND is_used = false`,
      [body.user_id, body.email]
    )

    // 認証情報を登録
    const code = randomInt(0, 1000000).toString().padStart(6, '0')
    await pool.query(
      `INSERT INTO benri_map.auth_codes
        (benri_map_user_id, email, code, expires_at)
        VALUES ($1, $2, $3, $4)`,
      [body.user_id, body.email, code, new Date(Date.now() + 10 * 60 * 1000)]
    )
    console.log('メール送信開始:');


    // メール送信
    const message = `
      <html>
        <head>
            <meta charset="utf-8" />
        </head>
        <body>
          <div>
            <div>8Cloudsmap にログインするための認証コードは以下になります。</div>
            <div style="margin: 10px 0;">
              <p style="font-size:20px;">${code}<p>
            </div>
            <div>このコードを認証画面に入力してください。</div>
            <div>このコードは10分後無効になります。</div>
          </div>
        </body>
      </html>`

    const response = await fetch(getUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: encodeURIComponent('address') + '=' + encodeURIComponent(body.email) + '&' + encodeURIComponent('title') + '=' + encodeURIComponent(body.domain + ' 認証コード') + '&' + encodeURIComponent('message') + '=' + encodeURIComponent(message)
    })

    console.log('メールの送信に成功');
    return c.json({
      success: true,
      message: '認証コードを送信しました'
    });
  } catch (error) {
    console.error('メールの送信に失敗');
    console.error(error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;