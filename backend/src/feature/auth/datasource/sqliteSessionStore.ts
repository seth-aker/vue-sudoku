import type {Database, Statement} from 'better-sqlite3'
import type { SessionData } from 'express-session'
import { Store } from 'express-session'
import { EventEmitterOptions } from 'node:events'

const noop = (..._args: any) => {};

interface SessionRow {
  sid: string,
  sess: string,
  expire: string
}

interface SqliteSessionScripts {
  clear: Statement
  createTable: Statement
  get: Statement<{sid: string}, SessionRow>
  set: Statement<SessionRow>
  destroy: Statement<{sid: string}>
  all: Statement<unknown[], SessionRow[]>
  touch: Statement<{sid: string, expire: string}>
  length: Statement<unknown[], number>
}

export interface SqliteSessionStoreOptions extends EventEmitterOptions{
  client: Database,
  tableName?: string
}

export class SqliteSessionStore extends Store {
  sessionTableName: string
  client: Database;
  scripts: SqliteSessionScripts
  private oneDayMs = 1000 * 60 * 60 * 24;
  constructor(options: SqliteSessionStoreOptions) {
    super(options)
   
    this.client = options.client;
    this.sessionTableName = options.tableName ?? 'sessions'
    
    this.scripts = this.prepareScripts()
    this.scripts.createTable.run()
  }

  clear(callback: (err?: any) => void = noop) {
    try {
      this.scripts.clear.run()
    } catch (err) {
      console.error(err)
      if(callback) {
        callback(err)
      }
    }
  }
  get(sid: string, callback: (err: any, session?: SessionData | null) => void): void {
    try {
      const res = this.scripts.get.get({sid});
      if(res?.sess) {
        callback(null, JSON.parse(res.sess));
      } else {
        callback(null, null);
      }
    } catch (err) {
      callback(err)
    }
  }
  set(sid: string, session: SessionData, callback: (err?: any) => void = noop): void {
    const age = session.cookie.maxAge ?? this.oneDayMs // one day
    const now = Date.now()
    const expire = new Date(now + age).toISOString()
    const entry = { sid, sess: JSON.stringify(session), expire};

    try {
      this.scripts.set.run(entry);
    } catch (err) {
      callback(err)
      console.log(err)
    }
  }
  destroy(sid: string, callback: (err?: any) => void = noop): void {
    try {
      this.scripts.destroy.run({sid})
    } catch (err) {
      callback(err)
      console.error(err)
    }
  }
  all(callback: (err: any, obj?: SessionData[] | { [sid: string]: SessionData } | null) => void): void {
    try {
      const res = this.scripts.all.get()
      if(res) {
        const sessions: Record<string, SessionData> = {}
        res.forEach(row => {
          sessions[row.sid] = JSON.parse(row.sess) as SessionData
        })
        callback(null, sessions)
      }
    } catch (err) {
      callback(err)
    }
  }

  length(callback: (err: any, length?: number) => void): void {
    try {
      const count = this.scripts.length.get()
      if(count) {
        callback(null, count);
      }
    } catch (err) {
      callback(err)
    }
  }
  touch(sid: string, session: SessionData, callback: () => void = noop): void {
    const entry = {sid} as SessionRow
    if(session.cookie.expires) {
      entry.expire = new Date(session.cookie.expires).toISOString()
    } else {
      entry.expire = new Date(Date.now() + this.oneDayMs).toISOString()
    }
    try {
      this.scripts.touch.run(entry)
      callback()
    } catch (err) {
      callback()
    }
  }

  private prepareScripts() {
    const clearScript = `DELETE FROM ${this.sessionTableName} WHERE datetime('now') > datetime(expire)`
    const createTableScript = `
      CREATE TABLE IF NOT EXISTS ${this.sessionTableName}
      (
        sid TEXT NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TEXT NOT NULL
      );
    `
    const getScript = `
      SELECT sess
      FROM ${this.sessionTableName}
      WHERE sid = @sid AND datetime('now') < datetime(expire);
    `
    const setScript = `
      INSERT OR REPLACE INTO 
        ${this.sessionTableName} 
      VALUES 
      (
        @sid,
        @sess,
        @expire
      );
    `
    const destroyScript = `
      DELETE FROM ${this.sessionTableName} WHERE sid = ?;
    `
    const allScript = `
      SELECT * FROM ${this.sessionTableName};
    `
    const touchScript = `
      UPDATE ${this.sessionTableName}
      SET expire = @expire
      WHERE sid = @sid AND datetime('now') < datetime('expire');
    `
    const lengthScript = `
      SELECT COUNT(*) FROM ${this.sessionTableName};
    `

    const scripts: SqliteSessionScripts = {
      clear: this.client.prepare(clearScript),
      createTable: this.client.prepare(createTableScript),
      get: this.client.prepare(getScript),
      set: this.client.prepare(setScript),
      destroy: this.client.prepare(destroyScript),
      all: this.client.prepare(allScript),
      touch: this.client.prepare(touchScript),
      length: this.client.prepare(lengthScript)
    }
    return scripts
  }
}