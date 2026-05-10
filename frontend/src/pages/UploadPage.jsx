import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, Film, Zap } from 'lucide-react'

export default function UploadPage({ onUpload }) {
  const [dragOver, setDragOver] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.mkv'] },
    maxFiles: 1,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
  })

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background grain */}
      <div className="fixed inset-0 noise-overlay pointer-events-none opacity-40" />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[800px] h-[400px] rounded-full opacity-5
                        bg-gradient-radial from-ink-500 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between border-b border-ink-900/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ink-700 flex items-center justify-center">
            <Zap size={16} className="text-ink-200" />
          </div>
          <span className="font-display text-ink-200 text-lg tracking-tight">VideoInsight</span>
        </div>
        <span className="label-tag">Engagement Analysis System</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 max-w-2xl"
        >
          <p className="label-tag mb-4">Deep Learning · BiLSTM + Transformer</p>
          <h1 className="font-display text-5xl md:text-6xl text-ink-50 leading-tight mb-4">
            Understand your<br />
            <em className="text-ink-400 not-italic">video engagement</em>
          </h1>
          <p className="font-body text-ink-400 text-lg leading-relaxed max-w-xl mx-auto">
            Upload any video and get frame-level engagement predictions,
            drop-off detection, and cut suggestions powered by deep learning.
          </p>
        </motion.div>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          <div
            {...getRootProps()}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed p-16
              transition-all duration-300 group
              ${isDragActive
                ? 'border-ink-500 bg-ink-900/60 scale-[1.02]'
                : 'border-ink-800 bg-ink-950/50 hover:border-ink-600 hover:bg-ink-900/40'
              }
            `}
          >
            <input {...getInputProps()} />

            {/* Scanning line on drag */}
            {isDragActive && (
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-ink-400 to-transparent opacity-60 animate-scan" />
              </div>
            )}

            <div className="flex flex-col items-center gap-6">
              <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
                ${isDragActive ? 'bg-ink-700 scale-110' : 'bg-ink-900 group-hover:bg-ink-800'}
              `}>
                {isDragActive
                  ? <Film size={36} className="text-ink-200" />
                  : <Upload size={36} className="text-ink-500 group-hover:text-ink-300 transition-colors" />
                }
              </div>

              <div className="text-center">
                <p className="font-body text-ink-200 text-lg font-medium mb-1">
                  {isDragActive ? 'Drop to analyze' : 'Drop your video here'}
                </p>
                <p className="font-body text-ink-500 text-sm">
                  or click to browse — MP4, MOV, AVI, MKV · Max 500MB
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-3 mt-10 justify-center"
        >
          {[
            'Engagement curve',
            'Drop-off timestamps',
            'Risk zone detection',
            'Cut suggestions',
            'Peak moments',
          ].map((f) => (
            <span key={f} className="font-mono text-xs text-ink-500 border border-ink-800 px-3 py-1.5 rounded-full">
              {f}
            </span>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-5 border-t border-ink-900/60 flex items-center justify-between">
        <span className="label-tag">ResNet50 + BiLSTM + Transformer · TVSum50</span>
        <span className="label-tag">MIT Academy of Engineering</span>
      </footer>
    </div>
  )
}
