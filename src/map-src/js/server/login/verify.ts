
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono();
const ATTEMPT_LIMIT = 5;

app.post('/verify', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('verify実行:', body);

    // emailでコードを取得
    const result = await pool.query(
      `SELECT * FROM benri_map.auth_codes
      WHERE auth_codes.email = $1 AND auth_codes.is_used = false`,
      [body.email]
    );

    if (result.rows.length > 0) {
      // 認証コード取得成功時
      const auth_code = result.rows[0];
      console.log('認証コード取得成功:', auth_code);

      // 試行回数をインクリメント
      const updatedResult = await pool.query(
        `UPDATE benri_map.auth_codes
          SET attempts = attempts + 1
          WHERE id = $1
          RETURNING *`,
        [auth_code.id]
      );
      const updatedAuthCode = updatedResult.rows[0];

      // 期限切れチェック
      const now = new Date();
      if (now > updatedAuthCode.expires_at) {
        console.log('認証失敗: 認証コードの有効期限が切れています');
        return c.json({
          success: false,
          message: '認証コードの有効期限が切れています。'
        }, 422);
      }

      // 認証回数チェック
      if (updatedAuthCode.attempts >= ATTEMPT_LIMIT) {
        console.log('認証失敗: 認証コードの試行回数が上限に達しました');
        return c.json({
          success: false,
          message: '認証コードの試行回数が上限に達しました。'
        }, 422);
      }

      // コード一致チェック
      if (updatedAuthCode.code !== body.code) {
        console.log('認証失敗: 認証コードが正しくありません');
        return c.json({
          success: false,
          message: '認証コードが正しくありません。'
        }, 400);
      }

      // 認証成功時、is_usedをtrueに更新
      await pool.query(
        `UPDATE benri_map.auth_codes
         SET is_used = true
         WHERE id = $1`, [updatedAuthCode.id]
      );

      console.log('認証成功: 認証コードが確認されました');
      return c.json({
        success: true,
        message: '認証コードが確認されました。',
      });
    } else {
      // 認証コード取得失敗時
      console.log('認証失敗: 認証コードが存在しません');
      return c.json({
        success: false,
        message: '予期せぬエラーが発生しました。再度認証コードを取得してください。'
      }, 404);
    }
  } catch (error) {
    console.error('verifyエラー:', error);
    return c.json({
      success: false,
      message: '予期せぬエラーが発生しました。しばらくしてから再度お試しください。'
    }, 500);
  }
})

export default app;