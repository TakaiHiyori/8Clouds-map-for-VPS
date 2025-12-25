
import { Hono } from 'hono';
import pool from '../db';

const app = new Hono()

app.post('/getConfig', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  try {
    const body = await c.req.json();
    console.log('getConfig実行:', body);

    // ドメインを取得
    const getDomain = await pool.query(
      `SELECT * FROM domain WHERE domain_text = $1`,
      [body.domain]
    )

    const config: { [key: string]: any } = {
      domainId: getDomain.rows[0].id,
      domain: getDomain.rows[0].domain,
      openDomain: getDomain.rows[0].open_domain_text
    }

    // オプションを取得
    const getOptions = await pool.query(
      `SELECT * FROM options WHERE domain = $1`,
      [getDomain.rows[0].id]
    )

    for (let i = 0; i < getOptions.rows.length; i++) {
      config[getOptions.rows[i].option] = getOptions.rows[i].valid
    }

    // 設定を取得
    const getConfigs = await pool.query(
      `SELECT * FROM configs WHERE domain = $1 ORDER BY id asc`,
      [getDomain.rows[0].id]
    );

    // 取得した設定の数ループ
    for (let i = 0; i < getConfigs.rows.length; i++) {
      const getConfig = getConfigs.rows[i]

      config['config' + (i + 1)] = {
        id: getConfig.id,
        mapTitle: getConfig.map_title,
        openURL: getConfig.open_url,
        appId: getConfig.app_id,
        token: getConfig.token,
        centerLat: getConfig.center_lat,
        centerLng: getConfig.center_lng,
        marker: getConfig.marker,
        name: getConfig.name,
        latitude: getConfig.latitude,
        longitude: getConfig.longitude,
        group: getConfig.group,
        color: getConfig.color,
        addImage: JSON.parse(getConfig.add_image),
        mapTile: getConfig.map_tile,
        creater: getConfig.creater,
        valid: getConfig.valid
      }

      // 色の設定を取得
      const getColors = await pool.query(
        `SELECT * FROM colors WHERE config = $1`,
        [getConfig.id]
      )

      config['config' + (i + 1)]['change_color_row_num'] = getColors.rows.length;
      for (let j = 0; j < getColors.rows.length; j++) {
        const getColor = getColors.rows[j]
        config['config' + (i + 1)]['change_color_row' + (j + 1)] = {
          option: getColor.text,
          color: getColor.color,
          icon: getColor.icon,
          iconColor: getColor.icon_color,
        }
      }

      // ポップアップの設定を取得
      const getPopups = await pool.query(
        `SELECT * FROM popups WHERE config = $1`,
        [getConfig.id]
      )

      config['config' + (i + 1)]['popup_row_num'] = getPopups.rows.length;
      for (let j = 0; j < getPopups.rows.length; j++) {
        const getPopup = getPopups.rows[j]
        config['config' + (i + 1)]['popup_row' + (j + 1)] = {
          popupField: getPopup.field,
          popupFieldName: getPopup.label
        }
      }

      const getNarrows = await pool.query(
        `SELECT * FROM narrowDown WHERE config = $1`,
        [getConfig.id]
      )

      config['config' + (i + 1)]['narrow_row_number'] = getNarrows.rows.length;
      for (let j = 0; j < getNarrows.rows.length; j++) {
        const getNarrow = getNarrows.rows[j]
        config['config' + (i + 1)]['narrow_row' + (j + 1)] = {
          field: getNarrow.field,
          condition: getNarrow.condition,
          value: JSON.parse(getNarrow.value),
          andor: getNarrow.andor
        }
      }

      const showUsers = await pool.query(
        `SELECT * FROM mapShowUsers WHERE config = $1`,
        [getConfig.id]
      )

      config['config' + (i + 1)]['users_row_number'] = showUsers.rows.length;
      for (let j = 0; j < showUsers.rows.length; j++) {
        const showUser = showUsers.rows[j]
        config['config' + (i + 1)]['user_row' + (j + 1)] = {
          user: showUser.user,
          edit: showUser.edit,
          create: showUser.create,
          setConfig: showUser.set_config,
        }
      }
    }

    return c.json(config)
  } catch (error) {
    console.error('getConfigエラー:', error);
    return c.json({
      success: false,
      message: 'サーバーエラーが発生しました'
    }, 500);
  }
})

export default app;