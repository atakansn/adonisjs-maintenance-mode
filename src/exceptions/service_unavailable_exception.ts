import { Exception } from '@adonisjs/core/exceptions'

export class ServiceUnavailableException extends Exception {
  static status = 503
  static code = 'E_SERVICE_UNAVAILABLE'
}
