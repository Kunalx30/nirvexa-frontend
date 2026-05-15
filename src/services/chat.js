import api from './api'

export const chatService = {

  async sendMessage(message, options = {}) {
    const res = await api.post('/chat', {
      message,
      session_id: options.sessionId || undefined,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
    })
    return res.data.data
  },

  async getHistory(page = 1, perPage = 20, sessionId = null) {
    const res = await api.get('/chat/history', {
      params: { page, per_page: perPage, session_id: sessionId || undefined }
    })
    return res.data.data
  },

  async clearHistory(sessionId = null) {
    const res = await api.delete('/chat/history', {
      params: { session_id: sessionId || undefined }
    })
    return res.data.data
  },

  async listSessions() {
    const res = await api.get('/chat/sessions')
    return res.data.data
  },

  async createSession(title = 'New chat') {
    const res = await api.post('/chat/sessions', { title })
    return res.data.data
  },

  async updateSession(sessionId, title) {
    const res = await api.patch(`/chat/sessions/${sessionId}`, { title })
    return res.data.data
  },

  async deleteSession(sessionId) {
    const res = await api.delete(`/chat/sessions/${sessionId}`)
    return res.data.data
  },
}
