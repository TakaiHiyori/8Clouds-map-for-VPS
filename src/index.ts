import 'dotenv/config';

import { HTTP_PORT } from './config';
import { serve } from '@hono/node-server'
import { Hono } from 'hono';
import { logger } from 'hono/logger'
import { serveStatic } from '@hono/node-server/serve-static';

import checkLogin from './map-src/js/server/login/checkLogin';

import getConfig from './map-src/js/server/config/getConfig';
import getPublicConfig from './map-src/js/server/config/getPublicConfig';
import setConfig from './map-src/js/server/config/setConfig';
import updateConfig from './map-src/js/server/config/updateConfig';
import deleteConfig from './map-src/js/server/config/deleteConfig';
import setNarrow from './map-src/js/server/config/setNarrow';

import getUsers from './map-src/js/server/user/getUsers';
import setUsers from './map-src/js/server/user/setUser';
import updateUsers from './map-src/js/server/user/updateUser';
import deleteUsers from './map-src/js/server/user/deleteUser';
import setShowMapUsers from './map-src/js/server/user/setShowMapUsers';

import getDomain from './map-src/js/server/geDomain';

import getField from './map-src/js/server/kintone/getField'
import getRecords from './map-src/js/server/kintone/getRecords'
import getStatus from './map-src/js/server/kintone/getStatus'
import getLayout from './map-src/js/server/kintone/getLayout'
import uploadFile from './map-src/js/server/kintone/uploadFile'
import postRecord from './map-src/js/server/kintone/postRecord'
import postRecords from './map-src/js/server/kintone/postRecords'
import putRecord from './map-src/js/server/kintone/putRecord'
import getRecord from './map-src/js/server/kintone/getRecord'
import getNewRecords from './map-src/js/server/kintone/getNewRecords'
import getFile from './map-src/js/server/kintone/getFile'

import mail from './mail/mail'

import getGeojson from './map-src/js/server/getSHPfile';
import getLatlng from './map-src/js/server/getLatlng';

const app = new Hono()

// export const customLogger = (message: string, ...rest: string[]) => {
//   console.log(message, ...rest)
// }

// app.use(logger(customLogger))
app.use('*', logger())

// APIルート（最初に定義）
app.route('/', checkLogin)

app.route('/', getConfig)
app.route('/', getPublicConfig)
app.route('/', setConfig)
app.route('/', updateConfig)
app.route('/', deleteConfig)
app.route('/', setNarrow)

app.route('/', getUsers)
app.route('/', setUsers)
app.route('/', updateUsers)
app.route('/', deleteUsers)
app.route('/', setShowMapUsers)

app.route('/', getDomain)

app.route('/', getField)
app.route('/', getRecords)
app.route('/', getStatus)
app.route('/', getLayout)
app.route('/', uploadFile)
app.route('/', postRecord)
app.route('/', postRecords)
app.route('/', putRecord)
app.route('/', getRecord)
app.route('/', getNewRecords)
app.route('/', getFile)

app.route('/', mail)

app.route('/', getGeojson)
app.route('/', getLatlng)

//htmlファイルの配信
app.use('/notAccess', serveStatic({ path: './html/notAccessPage.html' }))
// app.use('/8CloudsPablicMap', serveStatic({ path: './html/map.html' }))
app.use('/*/config', serveStatic({ path: './html/config.html' }))
app.use('/*/detail/*', serveStatic({ path: './html/detail.html' }))
app.use('/*/login', serveStatic({ path: './html/login.html' }))

//jsとcssファイルの配信
app.use('/map.js', serveStatic({ path: './map/map.js' }))
app.use('/map.css', serveStatic({ path: './map/map.css' }))

app.use('/config.js', serveStatic({ path: './map/config.js' }))
app.use('/config.css', serveStatic({ path: './map/config.css' }))

app.use('/login.js', serveStatic({ path: './map/login.js' }))
app.use('/login.css', serveStatic({ path: './map/login.css' }))

app.use('/detail.js', serveStatic({ path: './map/detail.js' }))
app.use('/detail.css', serveStatic({ path: './map/detail.css' }))

app.use('/pin.png', serveStatic({ path: './image/pin.png' }))
app.use('/8clouds_logo1.png', serveStatic({ path: './image/8clouds_logo1.png' }))
app.use('/mapTile.png', serveStatic({ path: './image/mapTile.png' }))
app.use('/backCenter.png', serveStatic({ path: './image/backCenter.png' }))
app.use('/mapmune.png', serveStatic({ path: './image/mapmune.png' }))
app.use('/mapmuneclose.png', serveStatic({ path: './image/mapmuneclose.png' }))

app.use('/*/*', serveStatic({ path: './html/map.html' }))

//上記以外のURLの時はエラー
// app.get('/', (c) => c.redirect('/benri/notAccess'))
// app.all('/*', (c) => c.redirect('/benri/notAccess'))

serve({
  fetch: app.fetch,
  port: HTTP_PORT
}, (info) => {
  console.log(`Server is running on https://solution.8clouds.co.jp/benri/8CloudsMap/`)
})