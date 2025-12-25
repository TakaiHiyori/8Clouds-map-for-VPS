
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/setUser', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('setUser実行:', body);

    const setUser = await pool.query(
      `INSERT INTO users
        ("domain", user_name, user_id, email, password, authority)
        VALUES ($1, $2, $3, $4, md5($5), $6)
        RETURNING id`,
      [body.domain, body.name, body.id, body.email, body.password, body.authority]
    )

    const userId = setUser.rows[0].id;
    return c.json({
      success: true,
      id: userId
    })
  } catch (error) {
    console.error('checkLoginエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;