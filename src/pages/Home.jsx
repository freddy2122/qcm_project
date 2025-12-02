import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function Home() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    async function fetchQuizzes() {
      try {
        const { data } = await client.get('/quizzes')
        if (!active) return
        setQuizzes(data)
      } catch {
        if (!active) return
        setError('Impossible de charger les QCM pour le moment.')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchQuizzes()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <div className="max-w-5xl mx-auto p-6 text-center text-slate-500">Chargement de vos QCM...</div>
  }

  if (error) {
    return <div className="max-w-5xl mx-auto p-6 text-center text-red-600">{error}</div>
  }

  if (quizzes.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">Bienvenue !</h1>
        <p className="text-slate-600">Aucun QCM n’est disponible pour le moment. Revenez bientôt.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Mon espace QCM</p>
        <h1 className="text-3xl font-semibold text-slate-900">Choisissez un questionnaire à explorer</h1>
        <p className="text-slate-600">Chaque carte vous amène vers un QCM protégé, chronométré et prêt à démarrer.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <article
            key={quiz.id}
            className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm hover:shadow-lg transition-shadow"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-slate-900">{quiz.title}</h2>
              <span className="text-xs font-semibold tracking-widest text-indigo-500 uppercase">QCM</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {quiz.owner ? `Par ${quiz.owner.name}` : 'Par l\'équipe pédagogique'}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {quiz.question_count} questions · {quiz.time_per_question_seconds}s par question
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-500">Préparez-vous, le chronomètre démarre dès la première question.</div>
              <button
                type="button"
                onClick={() => navigate(`/quiz/${quiz.slug}`)}
                className="ml-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Commencer
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

