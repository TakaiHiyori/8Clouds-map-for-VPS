
import { Hono } from 'hono';

const app = new Hono()

app.post('/mail', async (c) => {
  c.header('Content-Type', 'application/json');
  try {
    const body = await c.req.json();

    const getUrl = `https://script.google.com/macros/s/AKfycbweLsCohZ_IjTb6XLPlkZGzsFOXicFDQVkf4nZ9m4fiJNd2Olio6-aAWD5cDfWGsy3W1Q/exec`;
    console.log('リクエストURL:', getUrl);

    const response = await fetch(getUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: encodeURIComponent('address') + '=' + encodeURIComponent(body.email) + '&' + encodeURIComponent('title') + '=' + encodeURIComponent(body.domain + ' 認証コード') + '&' + encodeURIComponent('message') + '=' + encodeURIComponent(body.message)

    })
    console.log(await response.json())
    console.log('メールの送信に成功')
  } catch (error) {
    console.error('メールの送信に失敗');
    console.error(error)
  }
})

export default app;