
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/deleteUser', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('deleteUser実行:', body);
    await pool.query(
      `DELETE FROM mapShowUsers WHERE user = $1`,
      [body.id]
    )
    await pool.query(
      `DELETE FROM users WHERE id = $1`,
      [body.id]
    )

    return c.json({ success: true })
  } catch (error) {
    console.error('deleteUserエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;