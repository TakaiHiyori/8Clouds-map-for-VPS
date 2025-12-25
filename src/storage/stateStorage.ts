// src/storage/stateStorage.ts
import { Client } from 'minio';

/**
 * MinIO クライアント初期化
 * 環境変数が無ければデフォルト値でローカルMinIOを想定
 */
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
  port: Number(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ROOT_USER || process.env.MINIO_ACCESS_KEY || 'your-access-key',
  secretKey: process.env.MINIO_ROOT_PASSWORD || process.env.MINIO_SECRET_KEY || 'your-secret-key',
});

const BUCKET = process.env.MINIO_BUCKET || 'kanban-states';

/**
 * オブジェクトキーを生成する
 * 例: kanban-states/5uz7f.../app-test-app/board-board1.json
 */
function buildObjectKey(domain: string, appId: string, boardId: string): string {
  return `kanban-states/${domain}/app-${appId}/board-${boardId}.json`;
}

/**
 * カンバン状態を MinIO に保存する（毎回上書き）
 */
export async function saveKanbanStateToMinio(
  domain: string,
  appId: string,
  boardId: string,
  state: unknown,
): Promise<void> {
  const key = buildObjectKey(domain, appId, boardId);
  const body = Buffer.from(JSON.stringify(state, null, 2), 'utf-8');

  // バケットがなければ作成（初回のみ）
  let exists = false;
  try {
    exists = await minioClient.bucketExists(BUCKET);
  } catch (e) {
    exists = false;
  }

  if (!exists) {
    await minioClient.makeBucket(BUCKET, '');
    console.log(`[MinIO] bucket created: ${BUCKET}`);
  }

  await minioClient.putObject(BUCKET, key, body);

  console.log(
    `[MinIO] saved kanban state: bucket=${BUCKET} key=${key} size=${body.length}bytes`,
  );
}

/**
 * カンバン状態を MinIO から読み込む（存在しなければ null）
 */
export async function loadKanbanStateFromMinio(
  domain: string,
  appId: string,
  boardId: string,
): Promise<unknown | null> {
  const key = buildObjectKey(domain, appId, boardId);

  try {
    const stream = await minioClient.getObject(BUCKET, key);
    const chunks: Buffer[] = [];

    return await new Promise<unknown>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        try {
          const json = Buffer.concat(chunks).toString('utf-8');
          const data = JSON.parse(json);
          console.log(`[MinIO] loaded kanban state: bucket=${BUCKET} key=${key}`);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      });
      stream.on('error', (err) => {
        // オブジェクトが無い場合など
        console.warn(`[MinIO] load error for key=${key}`, err);
        resolve(null);
      });
    });
  } catch (err) {
    console.warn(`[MinIO] getObject failed for key=${key}`, err);
    return null;
  }
}