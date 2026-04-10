export interface ChannelParticipantResponse {
  userId: string
  displayName: string
  role: 'TEACHER' | 'STUDENT' | 'OPERATOR'
}

export interface ChannelMessageResponse {
  messageId: string
  userId: string
  displayName: string
  role: 'TEACHER' | 'STUDENT' | 'OPERATOR'
  content: string
  createdAt: string
}

export interface ChannelEventResponse {
  type: 'presence' | 'message' | 'ready'
  participants: ChannelParticipantResponse[] | null
  message: ChannelMessageResponse | null
}
