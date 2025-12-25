
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/getUsers', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('getUsers実行:', body);

    const result = await pool.query(
      `SELECT * FROM users WHERE users.domain = $1 ORDER BY id asc`,
      [body.domain]
    );

    return c.json(result.rows)
  } catch (error) {
    console.error('checkLoginエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;