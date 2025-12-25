
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/setNarrow', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('setNarrow実行:', body);
    await pool.query(
      `DELETE FROM narrowDown WHERE config = $1`,
      [body.id]
    )

    for (let i = 0; i < body.conditions.length; i++) {
      await pool.query(
        `INSERT INTO narrowDown (config, field, condition, value, andor) VALUES ($1, $2, $3, $4, $5)`,
        [body.id, body.conditions[i].field, body.conditions[i].condition, body.conditions[i].value, body.conditions[i].andor]
      )
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('setNarrowエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;