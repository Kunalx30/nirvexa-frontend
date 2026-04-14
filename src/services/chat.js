import api from './api'

export const chatService = {

  async sendMessage(message, options = {}) {
    const res = await api.post('/chat', {
      message,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
    })
    return res.data.data
  },

  async getHistory(page = 1, perPage = 20) {
    const res = await api.get('/chat/history', {
      params: { page, per_page: perPage }
    })
    return res.data.data
  },

  async clearHistory() {
    const res = await api.delete('/chat/history')
    return res.data.data
  },
}