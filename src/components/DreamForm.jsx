import { useMemo, useState } from 'react'

export default function DreamForm({ onSubmit, disabled }) {
  const [dream, setDream] = useState('')
  const remaining = useMemo(() => 1200 - dream.length, [dream.length])

  function handleSubmit() {
    onSubmit(dream)
  }

  return (
    <div className="bg-slate-900/70 border border-indigo-500/20 rounded-3xl shadow-2xl p-8 w-full fade-in">
      <h2 className="text-xl font-bold text-slate-100">Describe your dream</h2>
      <p className="text-slate-300 text-sm mt-2">
        Any language is OK. Keep it under 1200 characters.
      </p>

      <textarea
        value={dream}
        onChange={(e) => setDream(e.target.value)}
        className="mt-5 w-full p-4 border-2 border-indigo-500/20 bg-slate-950/40 text-slate-100 rounded-2xl h-40 resize-none focus:border-indigo-400 focus:outline-none transition"
        placeholder="I was walking through a city made of mirrors..."
        disabled={disabled}
      />

      <div className="flex items-center justify-between mt-3">
        <span className={`text-xs ${remaining < 0 ? 'text-rose-300' : 'text-slate-400'}`}>
          {remaining} characters left
        </span>
        <span className="text-xs text-slate-400">Tip: include emotions and symbols</span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
      >
        Interpret Dream ✨
      </button>
    </div>
  )
}
