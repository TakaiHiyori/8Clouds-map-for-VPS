import type { WebSocket } from 'ws';

export type KanbanBoardState = any;

export interface Session {
  key: string;
  domain: string;
  appId: string;
  boardId: string;
  boardState: KanbanBoardState | null;
  clients: Set<WebSocket>;
  saveTimer?: NodeJS.Timeout | null;
  lastActiveAt: number;               // ★ 最終アクティブ時刻（epoch ms）
}

const sessions = new Map<string, Session>();

export function makeSessionKey(domain: string, appId: string, boardId: string): string {
  return `${domain}:${appId}:${boardId}`;
}

export function getOrCreateSession(domain: string, appId: string, boardId: string): Session {
  const key = makeSessionKey(domain, appId, boardId);

  let session = sessions.get(key);
  if (!session) {
    session = {
      key,
      domain,
      appId,
      boardId,
      boardState: null,
      clients: new Set<WebSocket>(),
      saveTimer: null,
      lastActiveAt: Date.now(),       // ★ 新規作成時に現在時刻
    };
    sessions.set(key, session);
  }
  return session;
}

export function getAllSessions(): Session[] {
  return Array.from(sessions.values());
}

export function deleteSession(key: string): void {
  sessions.delete(key);
}
