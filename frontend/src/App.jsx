import { useAnalysis } from './hooks/useAnalysis'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultsPage from './pages/ResultsPage'
import { motion, AnimatePresence } from 'framer-motion'

export default function App() {
  const { state, progress, message, result, error, filename, startAnalysis, reset } = useAnalysis()

  return (
    <AnimatePresence mode="wait">
      {state === 'idle' && (
        <motion.div key="upload"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <UploadPage onUpload={startAnalysis} />
        </motion.div>
      )}

      {(state === 'uploading' || state === 'processing') && (
        <motion.div key="processing"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <ProcessingPage progress={progress} message={message} filename={filename} />
        </motion.div>
      )}

      {state === 'done' && result && (
        <motion.div key="results"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <ResultsPage result={result} filename={filename} onReset={reset} />
        </motion.div>
      )}

      {state === 'error' && (
        <motion.div key="error"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex items-center justify-center px-8">
          <div className="card p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-signal-red/10 border border-signal-red/20
                            flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠</span>
            </div>
            <h2 className="font-display text-2xl text-ink-100 mb-3">Analysis Failed</h2>
            <p className="font-body text-ink-400 mb-8 text-sm leading-relaxed">
              {error || 'An unexpected error occurred. Please try again.'}
            </p>
            <button onClick={reset} className="btn-primary w-full">
              Try Again
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
