import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

export async function configure(_command: ConfigureCommand) {
  const codemods = await _command.createCodemods()

  try {
    await codemods.defineEnvValidations({
      leadingComment: 'APP_URL environemnt variables',
      variables: {
        APP_URL: 'Env.schema.string()',
      },
    })

    await codemods.defineEnvVariables({
      APP_URL: 'http://$HOST:$PORT',
    })

    await codemods.updateRcFile((rcFile) => {
      rcFile
        .addProvider('adonisjs-maintenance-mode/maintenance_provider')
        .addCommand('adonisjs-maintenance-mode/commands')
    })

    await codemods.makeUsingStub(stubsRoot, 'block_requests_during_maintenance_middleware.stub', {
      entity: _command.app.generators.createEntity('block_requests_during_maintenance'),
    })

    await codemods.registerMiddleware('server', [
      {
        path: '#middleware/block_requests_during_maintenance_middleware',
      },
    ])
  } catch (error) {
    _command.logger.error('Unable to update adonisrc.ts file')
    _command.logger.error(error)
  }
}
