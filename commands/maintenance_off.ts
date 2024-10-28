import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class MaintenanceOff extends BaseCommand {
  static commandName = 'maintenance:off'
  static description = 'Takes the application out of maintenance mode.'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    try {
      const maintenanceModeService = await this.app.container.make('maintenanceMode')

      if (!(await maintenanceModeService.isEnabled())) {
        this.logger.info('Application is already maintenance mode.')
        return
      }

      await maintenanceModeService.disabled()

      this.logger.success('Application is now live.')
    } catch (error) {
      this.logger.error(error)
    }
  }
}
