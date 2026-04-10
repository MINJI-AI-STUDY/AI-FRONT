import { API_BASE_URL, post } from './client'
import type { ChannelEventResponse } from './realtime_types'

export function subscribeChannelEvents(channelId: string, accessToken: string, onEvent: (event: ChannelEventResponse) => void): EventSource {
  const eventSource = new EventSource(`${API_BASE_URL}/api/channels/${channelId}/events?accessToken=${encodeURIComponent(accessToken)}`)
  eventSource.addEventListener('presence', (event) => onEvent(JSON.parse((event as MessageEvent).data)))
  eventSource.addEventListener('message', (event) => onEvent(JSON.parse((event as MessageEvent).data)))
  eventSource.addEventListener('ready', (event) => onEvent(JSON.parse((event as MessageEvent).data)))
  return eventSource
}

export async function enterChannel(channelId: string, token: string): Promise<void> {
  return post<void>(`/api/channels/${channelId}/presence/enter`, undefined, token)
}

export async function heartbeatChannel(channelId: string, token: string): Promise<void> {
  return post<void>(`/api/channels/${channelId}/presence/heartbeat`, undefined, token)
}

export async function leaveChannel(channelId: string, token: string): Promise<void> {
  return post<void>(`/api/channels/${channelId}/presence/leave`, undefined, token)
}
