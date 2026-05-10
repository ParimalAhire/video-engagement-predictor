import { useState, useEffect, useRef } from 'react'
import { uploadVideo, getJobStatus, deleteJob } from '../utils/api'

export const useAnalysis = () => {
  const [state, setState] = useState('idle') // idle | uploading | processing | done | error
  const [jobId, setJobId] = useState(null)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [filename, setFilename] = useState('')
  const pollRef = useRef(null)

  const startAnalysis = async (file) => {
    setState('uploading')
    setProgress(0)
    setMessage('Uploading video...')
    setResult(null)
    setError(null)
    setFilename(file.name)

    try {
      const { job_id } = await uploadVideo(file)
      setJobId(job_id)
      setState('processing')
      startPolling(job_id)
    } catch (err) {
      setState('error')
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    }
  }

  const startPolling = (id) => {
    pollRef.current = setInterval(async () => {
      try {
        const status = await getJobStatus(id)
        setProgress(status.progress)
        setMessage(status.message)

        if (status.status === 'completed') {
          clearInterval(pollRef.current)
          setState('done')
          setResult(status.result)
        } else if (status.status === 'failed') {
          clearInterval(pollRef.current)
          setState('error')
          setError(status.error || 'Analysis failed')
        }
      } catch (err) {
        clearInterval(pollRef.current)
        setState('error')
        setError('Lost connection to server')
      }
    }, 1500)
  }

  const reset = async () => {
    clearInterval(pollRef.current)
    if (jobId) {
      try { await deleteJob(jobId) } catch {}
    }
    setState('idle')
    setJobId(null)
    setProgress(0)
    setMessage('')
    setResult(null)
    setError(null)
    setFilename('')
  }

  useEffect(() => {
    return () => clearInterval(pollRef.current)
  }, [])

  return { state, progress, message, result, error, filename, startAnalysis, reset }
}
