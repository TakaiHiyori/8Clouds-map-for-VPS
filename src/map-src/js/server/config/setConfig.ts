
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/setConfig', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('setConfig実行:', body);
    const config = body.config
    const colors = body.colors;
    const popups = body.popup;
    const user = body.user;

    if (body.id === '') {
      const setConfig = await pool.query(
        `INSERT INTO benri_map.benri_map_configs
        ("domain", map_title, open_url, app_id, token, center_lat, center_lng, marker, name, latitude, longitude, "group", color, add_image, map_tile, creater, valid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id`,
        [config.domain, config.mapTitle, config.openURL, Number(config.appId), config.token, Number(config.centerLat), Number(config.centerLng), config.marker, config.name, config.latitude, config.longitude, config.group, config.color, config.addImage, config.mapTile, config.creater, true]
      )

      const configId = setConfig.rows[0].id;
      console.log('新規作成されたconfigId:', configId);

      for (const key in colors) {
        await pool.query(
          'INSERT INTO benri_map.benri_map_colors (config, text, color, icon, icon_color) VALUES ($1, $2, $3, $4, $5)',
          [configId, colors[key].option, colors[key].color, colors[key].icon, colors[key].iconColor]
        )
      }

      for (const key in popups) {
        await pool.query(
          'INSERT INTO benri_map.benri_map_popups (config, field, label) VALUES ($1, $2, $3)',
          [configId, popups[key].popupField, popups[key].popupFieldName]
        )
      }

      for (let i = 0; i < user.length; i++) {
        await pool.query(
          'INSERT INTO benri_map.benri_map_show_users (config, "user", edit, "create", set_config) VALUES ($1, $2, $3, $4, $5)',
          [configId, user[i], true, true, true]
        )
      }
      return c.json({ id: configId })
    } else {
      const setConfig = await pool.query(
        `UPDATE benri_map.benri_map_configs SET open_url = $1, app_id = $2, token = $3, center_lat = $4, center_lng = $5,
        marker = $6, name = $7, latitude = $8, longitude = $9, "group" = $10, color = $11, add_image = $12, map_tile = $13
        WHERE id = $14`,
        [config.openURL, Number(config.appId), config.token, Number(config.centerLat), Number(config.centerLng), config.marker, config.name, config.latitude, config.longitude, config.group, config.color, config.addImage, config.mapTile, body.id]
      )

      await pool.query(
        `DELETE FROM benri_map.benri_map_colors WHERE config = $1`,
        [body.id]
      )

      for (const key in colors) {
        await pool.query(
          'INSERT INTO benri_map.benri_map_colors (config, text, color, icon, icon_color) VALUES ($1, $2, $3, $4, $5)',
          [body.id, colors[key].option, colors[key].color, colors[key].icon, colors[key].iconColor]
        )
      }

      await pool.query(
        `DELETE FROM benri_map.benri_map_popups WHERE config = $1`,
        [body.id]
      )

      for (const key in popups) {
        await pool.query(
          'INSERT INTO benri_map.benri_map_popups (config, field, label) VALUES ($1, $2, $3)',
          [body.id, popups[key].popupField, popups[key].popupFieldName]
        )
      }
      return c.json({ id: body.id })
    }
  } catch (error) {
    console.error('setConfigエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;