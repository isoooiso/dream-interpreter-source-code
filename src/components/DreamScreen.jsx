import { useEffect, useMemo, useState } from 'react'
import DreamForm from './DreamForm'
import LoadingCard from './LoadingCard'
import ResultCard from './ResultCard'
import Gallery from './Gallery'
import TopBar from './TopBar'
import NetworkGuard from './NetworkGuard'
import { getGallery, interpretDream } from '../services/contractService'

export default function DreamScreen({ walletAddress, onDisconnect }) {
  const [isLoading, setIsLoading] = useState(false)
  const [stage, setStage] = useState('submitting')
  const [result, setResult] = useState(null)

  const [gallery, setGallery] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(false)

  const canSubmit = useMemo(() => Boolean(walletAddress) && !isLoading, [walletAddress, isLoading])

  async function refreshGallery() {
    try {
      setGalleryLoading(true)
      const items = await getGallery(walletAddress)
      setGallery(items)
    } catch {
      setGallery([])
    } finally {
      setGalleryLoading(false)
    }
  }

  useEffect(() => {
    refreshGallery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress])

  async function handleSubmitDream(dreamText) {
    const text = String(dreamText || '').trim()
    if (!text) {
      alert('Please describe your dream first.')
      return
    }
    if (text.length < 10) {
      alert('Please write at least 10 characters.')
      return
    }
    if (text.length > 1200) {
      alert('Please keep it under 1200 characters.')
      return
    }

    setResult(null)
    setIsLoading(true)
    setStage('submitting')

    try {
      setStage('judging')
      const res = await interpretDream(walletAddress, text)
      setResult(res)
      await refreshGallery()
    } catch (e) {
      alert(e?.message || 'Failed to interpret dream')
    } finally {
      setIsLoading(false)
    }
  }

  function handleNewDream() {
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 px-4">
      <div className="max-w-3xl mx-auto">
        <TopBar address={walletAddress} onDisconnect={onDisconnect} />

        <div className="pb-10">
          <div className="text-center mt-2 mb-6">
            <h1 className="text-4xl font-extrabold text-slate-50 tracking-tight">
              Decode your dreams ✨
            </h1>
            <p className="text-slate-300 mt-3">
              AI interprets your dream and rates how interesting it is. High-scoring dreams are saved on-chain.
            </p>
          </div>

          <div className="space-y-6">
            <NetworkGuard />

            {!result && !isLoading && (
              <DreamForm onSubmit={handleSubmitDream} disabled={!canSubmit} />
            )}

            {isLoading && <LoadingCard stage={stage} />}

            {result && !isLoading && (
              <ResultCard result={result} onNewDream={handleNewDream} walletAddress={walletAddress} />
            )}

            <Gallery items={gallery} isLoading={galleryLoading} onRefresh={refreshGallery} />
          </div>

          <div className="text-center text-xs text-slate-500 mt-10 pb-6">
            Entertainment only. Not medical or psychological advice.
          </div>
        </div>
      </div>
    </div>
  )
}
