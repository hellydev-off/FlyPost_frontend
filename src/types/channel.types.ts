export interface Channel {
  id: string
  telegramChannelId: string
  title: string
  username: string | null
  botIsAdmin: boolean
  createdAt: string
}

export interface CreateChannelPayload {
  telegramChannelId: string
  title: string
}
