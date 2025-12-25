
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/checkLogin', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('checkLogin実行:', body);

    const result = await pool.query(
      `SELECT users.* FROM users AS users JOIN domain ON users.domain = domain.id
      WHERE domain.domain_text = $1 AND users.user_id = $2 AND users.password = md5($3)`,
      [body.domain, body.id, body.pass]
    );

    if (result.rows.length > 0) {
      console.log('ログイン成功:', result.rows[0]);

      const getShowMaps = await pool.query(
        `SELECT * FROM mapShowUsers WHERE "user" = $1`,
        [result.rows[0].id]
      )

      return c.json({
        success: true,
        user: result.rows[0],
        showMaps: getShowMaps.rows
      });
    } else {
      console.log('ログイン失敗: ユーザーが見つかりません');
      return c.json({
        success: false,
        message: 'ユーザーが見つかりません'
      }, 401);
    }
  } catch (error) {
    console.error('checkLoginエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;