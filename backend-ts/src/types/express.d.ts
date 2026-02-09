import * as express from 'express'
import type { AuthUser } from './auth.type.js'

declare global {
    namespace Express {
        interface Request {
            user: AuthUser
        }
    }
}
