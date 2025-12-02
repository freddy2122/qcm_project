import { useEffect, useState } from 'react'
import client from '../api/client'

export default function AdminQuestions() {
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function fetchQuestions() {
      try {
        // On suppose qu il n y a qu un seul quiz pour l instant: le-fonctionnement-du-web
        const { data } = await client.get('/admin/quizzes/1/questions')
        if (!active) return
        setQuiz(data)
      } catch (e) {
        if (!active) return
        setError("Impossible de charger les questions du QCM.")
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchQuestions()
    return () => {
      active = false
    }
  }, [])

  if (loading) return <div className="p-6 text-center">Chargement des questions...</div>
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>
  if (!quiz) return <div className="p-6 text-center">Aucun QCM trouvé.</div>

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Gestion des questions</h1>
            <p className="text-sm text-gray-500">QCM : {quiz.title}</p>
          </div>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((q) => (
            <div key={q.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-500">Question {q.position}</div>
              </div>
              <div className="text-sm font-medium text-gray-900">{q.text}</div>
              <ul className="space-y-1 pl-4 list-disc text-sm text-gray-700">
                {q.options.map((opt) => (
                  <li key={opt.id} className={opt.is_correct ? 'font-semibold text-green-700' : ''}>
                    {opt.text}
                    {opt.is_correct && ' (bonne réponse)'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
