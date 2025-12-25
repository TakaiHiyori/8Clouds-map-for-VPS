
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/setShowMapUsers', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('setShowMapUsers実行:', body);
    await pool.query(
      `DELETE FROM mapShowUsers WHERE "user" <> $1 AND config = $2`,
      [body.admin, body.config]
    )
    for (let i = 0; i < body.showUsers.length; i++) {
      await pool.query(
        `INSERT INTO mapShowUsers (config, "user", edit, "create", set_config)
          VALUES ($1, $2, $3, $4, $5)`,
        [body.config, body.showUsers[i].id, body.showUsers[i].authority.edit, body.showUsers[i].authority.create, body.showUsers[i].authority.setConfig]
      )
    }

    return c.json({
      success: true
    })
  } catch (error) {
    console.error('setShowMapUsersエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;