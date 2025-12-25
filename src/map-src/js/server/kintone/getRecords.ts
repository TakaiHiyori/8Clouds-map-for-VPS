import { Hono } from 'hono';

const app = new Hono()

app.post('/kintone/getRecords', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8');
  const startTime = Date.now();

  try {
    const body = await c.req.json();
    console.log('getRecords実行:', body);

    const postUrl = `https://${body.domain}.cybozu.com/k/v1/records/cursor.json`;
    console.log('リクエストURL:', postUrl);

    const getCursor = await fetch(postUrl, {
      method: 'POST',
      headers: {
        "X-Cybozu-API-Token": body.token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        app: body.app,
        query: body.query,
        size: 500
      })
    })

    console.log('レスポンスステータス:', getCursor.status);

    if (!getCursor.ok) {
      const errorText = await getCursor.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`フィールドの取得に失敗しました。ステータス: ${getCursor.status}`)
    }
    const cursor = await getCursor.json();

    const getTotalCursor = await fetch(postUrl, {
      method: 'POST',
      headers: {
        "X-Cybozu-API-Token": body.token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        app: body.app,
        size: 500
      })
    })
    const totalCursor = await getTotalCursor.json();
    const totalCount = Number(totalCursor.totalCount) - Number(cursor.totalCount)

    await fetch(`https://${body.domain}.cybozu.com/k/v1/records/cursor.json?id=${totalCursor.id}`, {
      method: 'DELETE',
      headers: {
        "X-Cybozu-API-Token": body.token,
      }
    })

    const resultRecords = []
    const getUrl = `https://${body.domain}.cybozu.com/k/v1/records/cursor.json?id=${cursor.id}`;

    // for (let i = 1; i < cursor.totalCount; i += 500) {
    //   const getRecords = await fetch(getUrl, {
    //     method: 'GET',
    //     headers: {
    //       "X-Cybozu-API-Token": body.token,
    //     }
    //   })

    //   if (!getRecords.ok) {
    //     await fetch(getUrl, {
    //       method: 'DELETE',
    //       headers: {
    //         "X-Cybozu-API-Token": body.token,
    //       }
    //     })
    //     const errorText = await getRecords.text();
    //     console.error('エラーレスポンス:', errorText);
    //     throw new Error(`フィールドの取得に失敗しました。ステータス: ${getRecords.status}`)
    //   }

    //   const records = await getRecords.json();
    //   resultRecords.push(records.records);
    //   if (!records.next) {
    //     break;
    //   }
    // }

    while (true) {

      const getRecords = await fetch(getUrl, {
        method: 'GET',
        headers: {
          "X-Cybozu-API-Token": body.token,
        }
      })

      if (!getRecords.ok) {
        await fetch(getUrl, {
          method: 'DELETE',
          headers: {
            "X-Cybozu-API-Token": body.token,
          }
        })
        const errorText = await getRecords.text();
        console.error('エラーレスポンス:', errorText);
        throw new Error(`フィールドの取得に失敗しました。ステータス: ${getRecords.status}`)
      }

      const records = await getRecords.json();
      resultRecords.push(records.records);

      if (!records.next) {
        break;
      }
    }

    await fetch(getUrl, {
      method: 'DELETE',
      headers: {
        "X-Cybozu-API-Token": body.token,
      }
    })

    const elapsedTime = (Date.now() - startTime) / 1000;
    console.log(`getRecords完了 - 実行時間: ${elapsedTime.toFixed(2)}秒`);


    return c.json({
      success: true,
      totalCount: totalCount,
      records: resultRecords
    });

  } catch (error) {
    const elapsedTime = (Date.now() - startTime) / 1000;
    console.error(`getRecordsエラー - 実行時間: ${elapsedTime.toFixed(2)}秒`, error);

    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'サーバーエラーが発生しました',
      elapsedTime: elapsedTime.toFixed(2)
    }, 500);
  }
})

export default app;
