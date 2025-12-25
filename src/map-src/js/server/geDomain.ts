
import { Hono } from 'hono';
import pool from './db';

const app = new Hono()

app.post('/getDomain', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('getDomain実行:', body);

    // ドメインを取得
    const getDomain = await pool.query(
      `SELECT * FROM domain WHERE domain_text = $1`,
      [body.domain]
    )

    console.log(getDomain.rows)

    if (getDomain.rows.length === 0) {
      return c.json({
        success: false
      })
    } else {
      return c.json({
        success: true
      })
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