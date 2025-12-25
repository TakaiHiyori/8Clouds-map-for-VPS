
import { Hono } from 'hono';

const app = new Hono()

app.post('/getLatlng', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('getLatlng実行:', body);

    const url = `https://vldb.gsi.go.jp/sokuchi/surveycalc/surveycalc/xy2bl.pl?outputType=json&refFrame=2&zone=3&publicX=${body.x}&publicY=${body.y}`
    // const url = `https://vldb.gsi.go.jp/sokuchi/surveycalc/tky2jgd/tky2jgd.pl?outputType=json&sokuti=1&Place=2&zone=3&publicX=${body.x}&publicY=${body.y}`
    const latlngFromXY = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json"
      }
    });

    const latlng = await latlngFromXY.json()

    return c.json({
      success: true,
      latlng: latlng
    })
  } catch (error) {
    console.error('getLatlngエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;