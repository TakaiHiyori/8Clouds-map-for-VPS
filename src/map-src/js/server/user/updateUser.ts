
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.put('/updateUser', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('updateUser実行:', body);

    if (body.password === '') {
      await pool.query(
        `UPDATE benri_map.benri_map_users SET user_id = $1, user_name = $2, email = $3, authority = $4 WHERE id = $5`,
        [body.user_id, body.user_name, body.user_email, body.user_authority, body.id]
      )
    } else {
      await pool.query(
        `UPDATE benri_map.benri_map_users SET user_id = $1, user_name = $2, email = $3, authority = $4, password = md5($5) WHERE id = $6`,
        [body.user_id, body.user_name, body.uesr_email, body.user_authority, body.user_password, body.id]
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