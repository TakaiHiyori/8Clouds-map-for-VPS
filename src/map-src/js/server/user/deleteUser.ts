
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.delete('/deleteUser', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {

    const id = c.req.query('id')
    console.log('deleteUser実行:', id);
    await pool.query(
      `DELETE FROM benri_map.benri_map_show_users WHERE user = $1`,
      [id]
    )
    await pool.query(
      `DELETE FROM benri_map.benri_map_users WHERE id = $1`,
      [id]
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