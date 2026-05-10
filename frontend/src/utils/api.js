import axios from 'axios'

const API_BASE = '/api'

export const uploadVideo = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await axios.post(`${API_BASE}/analyze`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const getJobStatus = async (jobId) => {
  const res = await axios.get(`${API_BASE}/status/${jobId}`)
  return res.data
}

export const deleteJob = async (jobId) => {
  await axios.delete(`${API_BASE}/job/${jobId}`)
}

export const formatTimestamp = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const getRiskColor = (level) => {
  switch (level) {
    case 'high': return '#e63946'
    case 'medium': return '#f4a261'
    case 'low': return '#2a9d8f'
    default: return '#957e65'
  }
}

export const getRatingColor = (rating) => {
  switch (rating) {
    case 'Excellent': return '#2a9d8f'
    case 'Good': return '#57cc99'
    case 'Fair': return '#f4a261'
    case 'Poor': return '#e63946'
    default: return '#957e65'
  }
}
