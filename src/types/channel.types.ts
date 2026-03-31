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

export interface ChannelProfile {
  channelId: string
  tone: string | null
  audience: string | null
  topics: string[]
  forbiddenWords: string[]
  examples: string | null
}

export interface UpdateChannelProfilePayload {
  tone?: string | null
  audience?: string | null
  topics?: string[]
  forbiddenWords?: string[]
  examples?: string | null
}
