
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/setUser', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('setUser実行:', body);

    const setUser = await pool.query(
      `INSERT INTO benri_map.benri_map_users
        ("domain", user_name, user_id, email, password, authority)
        VALUES ($1, $2, $3, $4, md5($5), $6)
        RETURNING id`,
      [body.domain, body.user_name, body.user_id, body.user_email, body.user_password, body.user_authority]
    )

    console.log(setUser.rows)
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