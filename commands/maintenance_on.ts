import { BaseCommand, flags } from '@adonisjs/core/ace'
import { cuid } from '@adonisjs/core/helpers'
import { FilePayload } from '../src/types/index.js'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class MaintenanceOn extends BaseCommand {
  static commandName = 'maintenance:on'
  static description = 'Places the application in maintenance mode.'
  static help = [
    '[redirect]: The path where users should be redirected',
    '[render]: The pre-rendered view to display during maintenance mode',
    '[retry]: The number of seconds after which the request can be retried',
    '[refresh]: The number of seconds after which the browser may refresh',
    '[secret]: The secret phrase that may be used to bypass maintenance mode',
    '[random-secret]: Generates a random secret phrase for bypassing maintenance mode',
    '[status(default 503)]: The HTTP status code returned during maintenance mode',
  ]

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({
    description: 'The path that users should be redirected to',
  })
  declare redirect: string

  @flags.string({
    description: 'The view that should be pre-rendered for display during maintenance mode',
  })
  declare template: string

  @flags.string({
    description: 'The secret phrase that may be used to bypass maintenance mode',
  })
  declare secret: string

  @flags.number({
    description: 'The number of seconds after which the request may be retried',
  })
  declare retry: number

  @flags.number({
    description: 'The number of seconds after which the browser may refresh',
  })
  declare refresh: number

  @flags.number({
    description: 'The status code that should be used when returning the maintenance mode response',
  })
  declare status: number

  async run() {
    try {
      const maintenanceModeService = await this.app.container.make('maintenanceMode')

      if (await maintenanceModeService.isEnabled()) {
        this.logger.info('Application already is maintenance mode.')
        return
      }

      const filePayload = this.#filePayload()

      await maintenanceModeService.enabled(filePayload)

      this.logger.success('Application is now in maintenance mode.')

      if (filePayload?.secret !== null) {
        this.logger.info(
          `To skip maintenance mode, use this link: [${process.env.APP_URL}/${filePayload.secret}]`
        )
      }
    } catch (error) {
      this.logger.error(error)
    }
  }

  #filePayload(): FilePayload {
    return {
      redirect: this.#getRedirectPath(),
      retry: this.#getRetry(),
      refresh: this.refresh,
      secret: this.#getSecret(),
      status: Number(this.status) ?? 503,
      template: this.template ?? null,
    }
  }

  #getRedirectPath(): string {
    if (this.redirect && this.redirect !== '/') {
      return '/' + this.redirect.replace(/^\/|\/$/g, '').trim()
    }

    return this.redirect
  }

  #getRetry(): number | null {
    return !Number.isNaN(Number(this.retry)) && this.retry > 0 ? Number(this.retry) : null
  }

  #getSecret(): string | null {
    if (this.secret?.startsWith('random')) {
      return cuid()
    }

    if (this.secret) {
      return this.secret
    }

    return null
  }
}
