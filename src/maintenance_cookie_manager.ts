import { HttpContext } from '@adonisjs/core/http'
import { isCuid } from '@adonisjs/core/helpers'
import * as crypto from 'node:crypto'

export default class MaintenanceCookieManager {
  static createCookie(secret: string, ctx: HttpContext): any {
    const now = new Date()
    const expiresAt = new Date(now.setHours(now.getHours() + 12)).getTime()

    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.createHmac('sha256', salt).update(secret).digest('base64')

    return ctx.response.encryptedCookie(
      'adonisjs-maintenance',
      { expiresAt, hash, salt },
      { maxAge: expiresAt }
    )
  }

  static validateCookie(ctx: HttpContext, expectedSecret: string): boolean {
    const payload = ctx.request.encryptedCookie('adonisjs-maintenance')

    if (!payload || typeof payload?.expiresAt !== 'number') {
      return false
    }

    if (payload?.expiresAt < Date.now()) {
      return false
    }

    const expectedHash = crypto
      .createHmac('sha256', payload?.salt)
      .update(expectedSecret)
      .digest('base64')

    return payload.hash === expectedHash && isCuid(expectedSecret)
  }
}
