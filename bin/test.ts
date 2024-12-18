import { assert } from '@japa/assert'
import { configure, processCLIArgs, run } from '@japa/runner'
import { fileSystem } from '@japa/file-system'
import { apiClient } from '@japa/api-client'

processCLIArgs(process.argv.splice(2))

configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [assert(), fileSystem(), apiClient('http://localhost:3333')],
})

run()
