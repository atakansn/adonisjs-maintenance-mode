import { CastableHeader } from '@adonisjs/http-server/types'

export type FilePayload = {
  redirect: string
  retry: number | null
  refresh: number
  secret: string | null
  status: number
  template: string
}

export type HeaderData = { [key: string]: CastableHeader }
