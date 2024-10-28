import MaintenanceModeContract from './contracts/maintenance_mode_contract.js'
import { access, mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { FilePayload } from './types/index.js'

export default class MaintenanceModeWithFileSystem implements MaintenanceModeContract {
  async enabled(payload: FilePayload): Promise<void> {
    try {
      await access('tmp', constants.R_OK | constants.W_OK)
    } catch (error) {
      if (error.code === 'ENOENT') {
        await mkdir('tmp', { recursive: true })
      } else {
        throw new Error(`[ERROR]: Unable to access directory: ${error.message}`)
      }
    }

    try {
      await writeFile(this.file(), JSON.stringify(payload, null, 2), 'utf8')
    } catch (writeError) {
      throw new Error(`[ERROR]: Failed to write maintenance mode file: ${writeError.message}`)
    }
  }

  async disabled(): Promise<boolean> {
    try {
      if (this.file()) {
        await unlink(this.file())
      }

      return true
    } catch (error) {
      return false
    }
  }

  async getData(): Promise<FilePayload | null> {
    try {
      const data = await readFile(this.file(), 'utf8')

      return JSON.parse(data) as FilePayload
    } catch (e) {
      return null
    }
  }

  async isEnabled(): Promise<boolean> {
    try {
      await access(this.file())

      return true
    } catch (error) {
      return false
    }
  }

  private file(): string {
    return 'tmp/maintenance_mode_on'
  }
}
