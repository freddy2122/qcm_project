import { useEffect, useState } from 'react'
import client from '../api/client'

export default function Dashboard() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function fetchAttempts() {
      try {
        const { data: quizzes } = await client.get('/quizzes')
        if (!active) return
        const results = await Promise.all(
          quizzes.map(async (quiz) => {
            try {
              const res = await client.get(`/quizzes/${quiz.slug}/attempt`)
              return { quiz, attempt: res.data }
            } catch {
              return { quiz, attempt: null }
            }
          }),
        )
        if (active) setAttempts(results)
      } catch {
        if (active) setAttempts([])
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchAttempts()
    return () => {
      active = false
    }
  }, [])

  if (loading) return <div className="max-w-4xl mx-auto p-6 text-center text-slate-500">Chargement des tentatives...</div>

  if (attempts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Mon tableau de bord</h1>
        <p className="mt-2 text-slate-600">Aucun QCM n’est associé à votre compte.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Historique</p>
        <h1 className="text-3xl font-semibold text-slate-900">Mes résultats</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {attempts.map(({ quiz, attempt }) => (
          <article key={quiz.id} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-slate-900">{quiz.title}</h2>
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                {attempt ? (attempt.is_finished ? 'Terminé' : 'En cours') : 'Pas commencé'}
              </span>
            </div>
            {attempt ? (
              <>
                <p className="mt-2 text-sm text-slate-500">
                  Score actuel&nbsp;: <span className="font-semibold text-slate-900">{attempt.score}</span> /{' '}
                  {attempt.total}
                </p>
                <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                  {attempt.answers.map((a, i) => (
                    <div key={i} className="rounded-lg border px-3 py-2 text-sm bg-slate-50/80">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">Q{a.position}</span>
                        <span
                          className={
                            a.is_forfeit
                              ? 'text-slate-500'
                              : a.is_correct
                                ? 'text-green-600'
                                : 'text-red-600'
                          }
                        >
                          {a.is_forfeit ? 'Forfait' : a.is_correct ? 'Juste' : 'Faux'}
                        </span>
                        <span className="text-slate-500">{a.points} pt</span>
                      </div>

                      {a.question && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-slate-700">{a.question.text}</p>
                          <ul className="mt-1 space-y-0.5 text-xs">
                            {a.question.options.map((opt) => {
                              const selected = a.selected_option_ids?.includes(opt.id)
                              const correct = opt.is_correct

                              let className = 'text-slate-700'
                              if (selected && correct) {
                                className = 'text-green-700 font-semibold'
                              } else if (selected && !correct) {
                                className = 'text-red-600 line-through'
                              } else if (!selected && correct) {
                                className = 'text-green-600'
                              }

                              return (
                                <li key={opt.id} className={className}>
                                  {opt.text}
                                  {correct && !selected && ' (bonne réponse)'}
                                  {selected && correct && ' (votre réponse, correcte)'}
                                  {selected && !correct && ' (votre réponse, incorrecte)'}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Vous n’avez pas encore commencé ce QCM.</p>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
