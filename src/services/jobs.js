import api from './api'

// ── Job Listings ─────────────────────────────────────────────────────────────

/**
 * GET /jobs
 * Supports: q (FAISS semantic), location, company, skills, type, source, posted_within, page, limit
 */
export const fetchJobs = (params = {}) => {
  return api.get('/jobs', { params })
}

/**
 * GET /jobs/filters/options
 * Returns distinct sources and job types
 */
export const fetchJobFilterOptions = () => {
  return api.get('/jobs/filters/options')
}

/**
 * GET /jobs/premium
 * Curated NirVexa Premium jobs (locked preview for free users)
 */
export const fetchPremiumJobs = () => {
  return api.get('/jobs/premium')
}

/**
 * GET /jobs/:id
 * Single job with full description + ai_summary
 */
export const fetchJobById = (id) => {
  return api.get(`/jobs/${id}`)
}

/**
 * POST /jobs/match
 * Body: { skills: ['Python', 'SQL'] }
 * Returns top 10 jobs with match_percentage
 */
export const matchJobsBySkills = (skills) => {
  return api.post('/jobs/match', { skills })
}

// ── Saved Jobs ───────────────────────────────────────────────────────────────

/**
 * GET /user/saved-jobs
 * All saved jobs for the logged-in user
 */
export const fetchSavedJobs = () => {
  return api.get('/user/saved-jobs')
}

/**
 * POST /user/saved-jobs
 * Body: { job_id, status }
 */
export const saveJob = (job_id, status = 'Saved') => {
  return api.post('/user/saved-jobs', { job_id, status })
}

/**
 * PUT /user/saved-jobs/:id
 * Body: { status, notes }
 */
export const updateSavedJob = (savedJobId, data) => {
  return api.put(`/user/saved-jobs/${savedJobId}`, data)
}

/**
 * DELETE /user/saved-jobs/:id
 */
export const deleteSavedJob = (savedJobId) => {
  return api.delete(`/user/saved-jobs/${savedJobId}`)
}

// ── Job Alerts ───────────────────────────────────────────────────────────────

/**
 * GET /user/alerts
 */
export const fetchAlerts = () => {
  return api.get('/user/alerts')
}

/**
 * POST /user/alerts
 * Body: { keywords, location, frequency }
 */
export const createAlert = (data) => {
  return api.post('/user/alerts', data)
}

/**
 * DELETE /user/alerts/:id
 */
export const deleteAlert = (alertId) => {
  return api.delete(`/user/alerts/${alertId}`)
}