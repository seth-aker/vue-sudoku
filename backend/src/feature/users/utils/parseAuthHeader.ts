import * as jose from 'jose'
export function parseAuthHeader(header?: string) {
    if(!header) return undefined

    const token = header.startsWith('Bearer') ? header.split(' ')[1] : undefined
    if(!token) return undefined

    const parsedToken = jose.decodeJwt(token);
    return parsedToken;
}