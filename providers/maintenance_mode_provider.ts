import { ApplicationService, ContainerBindings } from '@adonisjs/core/types'
import { Application } from '@adonisjs/core/app'
import { Response } from '@adonisjs/core/http'
import MaintenanceModeContract from '../src/contracts/maintenance_mode_contract.js'
import MaintenanceModeWithFileSystem from '../src/maintenance_mode_with_file_system.js'
import { HeaderData } from '../src/types/index.js'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    maintenanceMode: MaintenanceModeContract
  }
}

declare module '@adonisjs/core/app' {
  interface Application<ContainerBindings> {
    inMaintenanceMode(): Promise<boolean>
  }
}

declare module '@adonisjs/core/http' {
  interface Response {
    appendHeaders(values: HeaderData): this
  }
}

export default class MaintenanceModeProvider {
  constructor(protected app: ApplicationService) {}

  async register() {
    this.app.container.singleton('maintenanceMode', () => new MaintenanceModeWithFileSystem())
  }

  async boot() {
    const maintenanceMode = await this.app.container.make('maintenanceMode')

    Application.macro('inMaintenanceMode', async function (this: Application<ContainerBindings>) {
      return maintenanceMode.isEnabled()
    })

    Response.macro('appendHeaders', function (this: Response, values: HeaderData): Response {
      Object.keys(values).forEach((value) => {
        this.append(value, values[value])
      })

      return this
    })
  }
}
