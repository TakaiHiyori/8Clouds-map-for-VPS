
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.get('/getUsers', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const domain = c.req.query('domain')
    // const body = await c.req.json();
    console.log('getUsers実行:', domain);

    const result = await pool.query(
      `SELECT bu.* FROM benri_map.benri_map_users bu
      JOIN benri_map.benri_map_domain bd ON bu.domain = bd.id
      WHERE bd.domain_text = $1 ORDER BY bu.id asc`,
      [domain]
    );

    return c.json(result.rows)
  } catch (error) {
    console.error('getUsersエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;