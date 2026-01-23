
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/deleteConfig', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('deleteConfig実行:', body);
    await pool.query(
      `DELETE FROM benri_map.benri_map_colors WHERE config = $1`,
      [body.id]
    )
    await pool.query(
      `DELETE FROM benri_map.benri_map_popups WHERE config = $1`,
      [body.id]
    )
    await pool.query(
      `DELETE FROM benri_map.benri_map_show_users WHERE config = $1`,
      [body.id]
    )
    await pool.query(
      `DELETE FROM benri_map.benri_map_conditions WHERE config = $1`,
      [body.id]
    )
    await pool.query(
      `DELETE FROM benri_map.benri_map_configs WHERE id = $1`,
      [body.id]
    )

    return c.json({ success: true })
  } catch (error) {
    console.error('deleteConfigエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;