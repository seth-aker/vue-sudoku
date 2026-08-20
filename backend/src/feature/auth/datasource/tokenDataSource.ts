export interface TokenRecord {
    user_id: string,
    expires_at: Date,
}

export interface TokenDataSource {
    close: () => void
    get: (token: string) => Promise<TokenRecord | undefined>
    rotateRefreshToken: (token: string) => Promise<{token: string, userId: string}>
    create: (userId: string) => Promise<string>
    delete: (token: string) => Promise<void>
}