import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { stringMatcher } from './helpers/index.js'
import MaintenanceCookieManager from './maintenance_cookie_manager.js'
import { ServiceUnavailableException } from './exceptions/service_unavailable_exception.js'
import { FilePayload, HeaderData } from './types/index.js'
import app from '@adonisjs/core/services/app'

export default class EnsureMaintenanceMode {
  protected excludedUrls: string[] = []

  async handle(ctx: HttpContext, next: NextFn): Promise<any> {
    if (this.isUrlExcluded(ctx)) {
      return await next()
    }

    const maintenanceMode = await app.container.make('maintenanceMode')

    if (!(await maintenanceMode.isEnabled())) {
      return await next()
    }

    if (await maintenanceMode.isEnabled()) {
      const data = (await maintenanceMode.getData())!

      if (data?.secret && ctx.request.url().split('/')[1] === data?.secret) {
        return this.handleBypassCookieWithRedirect(data, ctx)
      }

      if (await this.validateBypassCookie(data, ctx)) {
        return await next()
      }

      if (data?.redirect) {
        const path =
          data?.redirect === '/' ? data.redirect : data.redirect?.replace(/^\/+|\/+$/g, '')?.trim()

        if (ctx.request.url() !== path) {
          return ctx.response.redirect().toPath(path)
        }
      }

      const { usingEdgeJS } = await app.container.make('app')

      if (data?.template && usingEdgeJS) {
        return ctx.response
          .status(data?.status ?? 503)
          .appendHeaders(this.getHeaders(data))
          .send(
            //@ts-ignore
            await ctx.view.render(data.template, {
              state: {
                status: data?.status,
                retry: data?.retry,
                message: 'Application in maintenance mode',
              },
            })
          )
      }

      ctx.response.appendHeaders(this.getHeaders(data))

      throw new ServiceUnavailableException('Application in maintenance mode', {
        status: data?.status ?? 503,
      })
    }
  }

  protected handleBypassCookieWithRedirect(data: FilePayload, ctx: HttpContext) {
    MaintenanceCookieManager.createCookie(data?.secret as string, ctx)

    return ctx.response.redirect().toPath('/')
  }

  protected validateBypassCookie(data: FilePayload, ctx: HttpContext) {
    return (
      data?.secret &&
      ctx.request.encryptedCookie('adonisjs-maintenance') &&
      MaintenanceCookieManager.validateCookie(ctx, data?.secret)
    )
  }

  protected isUrlExcluded(ctx: HttpContext): boolean {
    for (let excluded of this.getExcludedUrls) {
      if (excluded !== '/') {
        excluded = excluded.replace(/^\/+|\/+$/g, '').trim()
      }

      if (
        ctx.request.url().includes(excluded) ||
        ctx.request.completeUrl().includes(excluded) ||
        stringMatcher(excluded, ctx.request.url().substring(1))
      ) {
        return true
      }
    }

    return false
  }

  protected getHeaders(data: FilePayload): HeaderData {
    const headers: HeaderData = data?.retry ? { 'Retry-After': data?.retry } : {}

    if (data?.refresh) {
      headers['Refresh'] = data?.refresh
    }

    return headers
  }

  get getExcludedUrls() {
    return this.excludedUrls ?? []
  }
}
