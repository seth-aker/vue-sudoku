import { config } from "@/core/config";
import { AuthOptions } from 'express-oauth2-jwt-bearer'
export const auth0Config: AuthOptions = {
    audience: config.audience,
    issuerBaseURL: config.issuerBaseUrl,
    tokenSigningAlg: 'RS256',
}