import { useState } from 'react'
import { renderStars, getLastDebug } from '../services/contractService'

export default function ResultCard({ result, onNewDream, walletAddress }) {
  const score = Number(result?.score ?? 0)
  const stars = renderStars(score)
  const mode = result?.fallback ? 'Fallback' : 'On-chain AI'

  const [debug, setDebug] = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadDebug() {
    try {
      setLoading(true)
      const d = await getLastDebug(walletAddress)
      setDebug(d)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/70 border border-indigo-500/20 rounded-3xl shadow-2xl p-8 w-full fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">AI Interpretation</h2>
        <div className="text-slate-200 font-bold">
          {stars} {score}/10
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-400">
        Mode: <span className="text-slate-200 font-semibold">{mode}</span>
      </div>

      <div className="mt-5 bg-slate-950/40 border border-indigo-500/10 rounded-2xl p-5">
        <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">
          {result?.interpretation || '—'}
        </p>
      </div>

      {result?.fallback && (
        <div className="mt-4">
          <button
            onClick={loadDebug}
            disabled={loading}
            className="bg-slate-200/10 text-slate-200 px-5 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10 disabled:opacity-60"
          >
            {loading ? 'Loading debug…' : 'Show debug'}
          </button>

          {debug && (
            <div className="mt-3 text-xs text-slate-300 bg-slate-950/40 border border-indigo-500/10 rounded-2xl p-4 whitespace-pre-wrap">
              <div className="text-slate-400">error:</div>
              <div className="text-rose-300">{String(debug.error ?? '')}</div>
              <div className="mt-3 text-slate-400">raw:</div>
              <div className="text-slate-200">{String(debug.raw ?? '')}</div>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-slate-300">
          Dream Score: <span className="font-bold text-slate-100">{score}/10</span>
          {result?.saved ? (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-300">
              ✨ Saved on-chain
            </span>
          ) : (
            <span className="ml-2 text-slate-400">(not saved)</span>
          )}
        </div>

        <button
          onClick={onNewDream}
          className="bg-slate-200/10 text-slate-200 px-6 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10"
        >
          New Dream ↻
        </button>
      </div>
    </div>
  )
}
