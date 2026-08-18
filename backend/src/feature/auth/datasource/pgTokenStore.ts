import { Sql } from "postgres";
import { TokenDataSource, TokenRecord } from "./tokenDataSource";
import { createHash } from 'node:crypto'

export class PgTokenStore implements TokenDataSource {
    static instance: PgTokenStore | null = null;
    private client: Sql;
    private ONE_DAY_MS = 1000 * 60 * 60 * 24; 
    private THIRTY_DAY_MS = this.ONE_DAY_MS * 30;
    private CLEAR_INTERVAL = 1000 * 60 * 15 // 15 minutes

    private timer: NodeJS.Timeout;
    private constructor(client: Sql) {
        this.client = client
        this.timer = setInterval(async () => {
            try {
                await this.client`
                    DELETE FROM refresh_tokens WHERE expires_at < to_timestamp(${this.currentPgTimestamp()})
                `
            } catch (err) {
                console.error(err)
            }
        }, this.CLEAR_INTERVAL)
        this.timer.unref()
    }

    public close() {
        clearInterval(this.timer)
    }

    static create(client: Sql) {
        if(!PgTokenStore.instance) {
            PgTokenStore.instance = new PgTokenStore(client);
        }
        return PgTokenStore.instance
    }

    public async get(token: string) {
        const hashedToken = this.hashToken(token);
        const [result] = await this.client<TokenRecord[]>`
            SELECT user_id, expires_at 
            FROM refresh_tokens
            WHERE token = ${hashedToken}
        `;
        return result;
    }

    public async create(token: string, userId: string) {
        const expiresAt = Math.ceil((Date.now() + this.THIRTY_DAY_MS) / 1000); // postgres to_timestamp takes seconds as its argument
        const hashedToken = this.hashToken(token);
        await this.client`
            INSERT INTO refresh_tokens (
                user_id,
                token,
                expires_at
            ) 
            SELECT ${userId}, ${hashedToken}, to_timestamp(${expiresAt})
            ON CONFLICT (token) DO UPDATE
            SET token = ${hashedToken}, expires_at = to_timestamp(${expiresAt})
        `
    }

    public async delete(token: string) {
        const hashedToken = this.hashToken(token);
        await this.client`
            DELETE FROM refresh_tokens 
            WHERE token = ${hashedToken};
        `
    }

    private currentPgTimestamp() {
        return Math.ceil(Date.now() / 1000);
    }

    private hashToken(token: string) {
        return createHash('sha256')
            .update(token)
            .digest('hex')
    }
}