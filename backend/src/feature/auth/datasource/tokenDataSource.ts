export interface TokenRecord {
    user_id: string,
    expires_at: Date
}

export interface TokenDataSource {
    close: () => void
    get: (token: string) => Promise<TokenRecord | undefined>
    create: (token: string, userId: string) => Promise<void>
    delete: (token: string) => Promise<void>
}