import { formatAddress } from '../services/contractService'

function clamp(text, max) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export default function Gallery({ items, isLoading, onRefresh }) {
  return (
    <div className="bg-slate-900/50 border border-indigo-500/10 rounded-3xl shadow-xl p-8 w-full fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">🌌 Dream Gallery</h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-slate-200/10 text-slate-200 px-5 py-2 rounded-full hover:bg-slate-200/15 transition border border-slate-200/10 disabled:opacity-60"
        >
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <p className="text-slate-400 text-sm mt-2">
        Dreams with score 8+ are stored on-chain.
      </p>

      <div className="mt-6 space-y-4">
        {items.length === 0 && (
          <div className="text-slate-400 text-sm bg-slate-950/30 border border-indigo-500/10 rounded-2xl p-5">
            No dreams saved yet. Be the first to submit something unusual ✨
          </div>
        )}

        {items.map((d, idx) => (
          <div key={idx} className="bg-slate-950/35 border border-indigo-500/10 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="text-slate-200 font-semibold">
                {clamp(d.dream, 120)}
              </div>
              <div className="text-slate-200 font-bold whitespace-nowrap">
                ⭐ {Number(d.score)}/10
              </div>
            </div>

            <div className="mt-3 text-slate-300 text-sm leading-relaxed">
              {clamp(d.interpretation, 220)}
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Author: {formatAddress(d.author)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
