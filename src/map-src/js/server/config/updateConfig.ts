
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/updateConfig', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('updateConfig実行:', body);

    await pool.query(
      `UPDATE benri_map.benri_map_configs SET valid = $1, map_title = $2 WHERE id = $3`,
      [body.valid, body.mapTitle, body.config]
    )

    return c.json({
      success: true
    })

  } catch (error) {
    console.error('updateConfigエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;