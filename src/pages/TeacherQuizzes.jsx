import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchQuizzes() {
    const start = Date.now()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await client.get('/teacher/quizzes')
      setQuizzes(data)
    } catch (e) {
      setError("Impossible de charger vos QCM.")
    } finally {
      const elapsed = Date.now() - start
      const minDelay = 3000
      if (elapsed < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed))
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  async function onCreate(e) {
    e.preventDefault()
    if (!title || !slug) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await client.post('/teacher/quizzes', {
        title,
        slug,
        time_per_question_seconds: 20,
        is_active: true,
      })
      setTitle('')
      setSlug('')
      await fetchQuizzes()
      setSuccess('QCM créé avec succès.')
    } catch (e) {
      setError("Création du QCM échouée (slug déjà utilisé ou données invalides).")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Mes QCM</h1>
          <p className="text-sm text-gray-500">
            Créez et gérez vos questionnaires. Les résultats des étudiants seront rattachés à vos QCM.
          </p>
        </div>

        <form onSubmit={onCreate} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-800">Nouveau QCM</h2>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className="border rounded px-3 py-2 text-sm md:col-span-2"
              placeholder="Titre du QCM"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              className="border rounded px-3 py-2 text-sm"
              placeholder="Slug (ex: fonctionnement-web)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
          >
            {saving ? 'Création...' : 'Créer le QCM'}
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">QCM existants</h2>
          {loading ? (
            <div className="text-sm text-gray-500">Chargement...</div>
          ) : quizzes.length === 0 ? (
            <div className="text-sm text-gray-500">Aucun QCM pour le moment.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {quizzes.map((q) => (
                <article key={q.id} className="border rounded-lg p-4 bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{q.title}</h3>
                      <p className="text-xs text-gray-500">Slug : {q.slug}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {q.question_count} questions · {q.time_per_question_seconds}s
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className={q.is_active ? 'px-2 py-0.5 rounded-full bg-green-50 text-green-700' : 'px-2 py-0.5 rounded-full bg-gray-100 text-gray-600'}>
                      {q.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
                      onClick={() => navigate(`/teacher/quizzes/${q.id}/questions`)}
                    >
                      Modifier les questions
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
                      onClick={() => navigate(`/teacher/quizzes/${q.id}/results`)}
                    >
                      Voir les résultats
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
