
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/updateUser', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('updateUser実行:', body);

    if (body.password === '') {
      await pool.query(
        `UPDATE users SET user_id = $1, user_name = $2, email = $3, authority = $4 WHERE id = $5`,
        [body.userId, body.name, body.email, body.authority, body.id]
      )
    } else {
      await pool.query(
        `UPDATE users SET user_id = $1, user_name = $2, email = $3, authority = $4, password = md5($5) WHERE id = $6`,
        [body.userId, body.name, body.email, body.authority, body.password, body.id]
      )
    }
    return c.json({
      success: true
    })
  } catch (error) {
    console.error('updateUserエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;