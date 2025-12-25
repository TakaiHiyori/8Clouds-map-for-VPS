
import { Hono } from 'hono';
import shapefile from "shapefile";

const app = new Hono()

app.post('/getGeojson', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('getGeojson実行:', body);
    // shapefileライブラリでGeoJSONに変換
    const geojson = await shapefile.read(body.shpBuffer, body.dbfBuffer, { shx: body.shxBuffer });

    return c.json({
      success: true,
      geojson: geojson
    })
  } catch (error) {
    console.error('getGeojsonエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;