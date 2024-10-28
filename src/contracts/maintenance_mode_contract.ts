import { FilePayload } from '../types/index.js'

/**
 * Interface for managing the maintenance mode of the application.
 */
export default interface MaintenanceModeContract {
  /**
   * Enables maintenance mode by writing a payload to a maintenance file.
   *
   * @param {FilePayload} payload - The payload containing data for enabling maintenance mode.
   * @returns {Promise<any>} A promise that resolves when the maintenance mode is enabled.
   */
  enabled: (payload: FilePayload) => Promise<void>

  /**
   * Disables maintenance mode by removing the maintenance file.
   *
   * @returns {Promise<void>} A promise that resolves when maintenance mode is disabled.
   */
  disabled: () => Promise<boolean>

  /**
   * Checks whether the application is currently in maintenance mode.
   *
   * @returns {Promise<any>} A promise that resolves with the current maintenance status.
   */
  isEnabled: () => Promise<boolean>

  /**
   * Retrieves the data related to the current maintenance mode.
   *
   * @returns {Promise<any>} A promise that resolves with the maintenance mode data.
   */
  getData: () => Promise<FilePayload | null>
}
