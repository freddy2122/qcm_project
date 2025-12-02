import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import client from '../api/client'

export default function TeacherQuizQuestions() {
  const { id } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newText, setNewText] = useState('')
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [options, setOptions] = useState([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ])
  const [saving, setSaving] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null) // { id, position }

  async function fetchQuiz() {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await client.get(`/teacher/quizzes/${id}/questions`)
      setQuiz(data)
    } catch (e) {
      setError("Impossible de charger les questions du QCM.")
    } finally {
      setLoading(false)
    }
  }

  async function deleteQuestion(questionId) {
    if (!window.confirm('Supprimer cette question ?')) return
    setError('')
    try {
      await client.delete(`/teacher/quizzes/${id}/questions/${questionId}`)
      await fetchQuiz()
    } catch (e) {
      setError('Suppression de la question échouée.')
    }
  }

  useEffect(() => {
    fetchQuiz()
  }, [id])

  function updateOption(index, changes) {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, ...changes } : opt)),
    )
  }

  function startEditQuestion(question) {
    setEditingQuestion({ id: question.id, position: question.position })
    setNewText(question.text)
    setAllowMultiple(!!question.allow_multiple)
    setOptions(
      question.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        is_correct: !!opt.is_correct,
      })),
    )
    setError('')
    setSuccess('')
  }

  function cancelEdit() {
    setEditingQuestion(null)
    setNewText('')
    setAllowMultiple(false)
    setOptions([
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ])
    setError('')
    setSuccess('')
  }

  function addOption() {
    setOptions((prev) => [...prev, { text: '', is_correct: false }])
  }

  function removeOption(index) {
    setOptions((prev) => {
      if (prev.length <= 2) return prev
      const next = prev.filter((_, i) => i !== index)
      // Si on supprime la seule bonne réponse, basculer la première en bonne
      if (!next.some((o) => o.is_correct)) {
        if (next[0]) next[0] = { ...next[0], is_correct: true }
      }
      return next
    })
  }

  function toggleCorrect(index) {
    if (!allowMultiple) {
      // Une seule bonne réponse
      setOptions((prev) => prev.map((opt, i) => ({ ...opt, is_correct: i === index })))
    } else {
      // Plusieurs possibles
      setOptions((prev) =>
        prev.map((opt, i) => (i === index ? { ...opt, is_correct: !opt.is_correct } : opt)),
      )
    }
  }

  async function onCreateQuestion(e) {
    e.preventDefault()
    if (!newText) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      if (editingQuestion) {
        await client.put(`/teacher/quizzes/${id}/questions/${editingQuestion.id}`, {
          text: newText,
          allow_multiple: allowMultiple,
          options,
        })
        setSuccess('Question mise à jour avec succès.')
      } else {
        await client.post(`/teacher/quizzes/${id}/questions`, {
          text: newText,
          allow_multiple: allowMultiple,
          options,
        })
        setSuccess('Question ajoutée avec succès.')
      }
      setNewText('')
      setAllowMultiple(false)
      setOptions([
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ])
      setEditingQuestion(null)
      await fetchQuiz()
    } catch (e) {
      setError("Création de la question échouée (vérifiez le texte et les réponses).")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-8 space-y-6">
        {loading && <div className="text-sm text-gray-500">Chargement...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}

        {quiz && (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">Questions du QCM</h1>
              <p className="text-sm text-gray-500">{quiz.title}</p>
            </div>

            <form onSubmit={onCreateQuestion} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  {editingQuestion ? 'Modifier la question' : 'Ajouter une question'}
                </h2>
                {editingQuestion && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-xs text-gray-500 underline"
                  >
                    Annuler la modification
                  </button>
                )}
              </div>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="Texte de la question"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                required
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={allowMultiple}
                  onChange={(e) => setAllowMultiple(e.target.checked)}
                />
                Plusieurs réponses possibles
              </label>

              <div className="space-y-2">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      className="flex-1 border rounded px-3 py-1 text-sm"
                      placeholder={`Réponse ${index + 1}`}
                      value={opt.text}
                      onChange={(e) => updateOption(index, { text: e.target.value })}
                      required
                    />
                    <label className="flex items-center gap-1 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={opt.is_correct}
                        onChange={() => toggleCorrect(index)}
                      />
                      Bonne réponse
                    </label>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-[11px] px-2 py-0.5 rounded border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Suppr.
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addOption}
                className="text-xs px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Ajouter une réponse
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
              >
                {saving ? (editingQuestion ? 'Mise à jour...' : 'Ajout...') : editingQuestion ? 'Mettre à jour la question' : 'Ajouter la question'}
              </button>
            </form>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Questions existantes</h2>
              {quiz.questions.length === 0 ? (
                <div className="text-sm text-gray-500">Aucune question pour le moment.</div>
              ) : (
                <div className="space-y-2">
                  {quiz.questions.map((q) => (
                    <div key={q.id} className="border rounded-lg p-3 bg-gray-50 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-gray-900">
                          Q{q.position}. {q.text}
                        </div>
                        <div className="flex items-center gap-2">
                          {q.allow_multiple && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              Plusieurs réponses possibles
                            </span>
                          )}
                          <button
                            type="button"
                            className="text-[11px] px-2 py-0.5 rounded border border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => deleteQuestion(q.id)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                      <ul className="text-xs text-gray-700 list-disc pl-5 space-y-0.5">
                        {q.options.map((opt) => (
                          <li
                            key={opt.id}
                            className={opt.is_correct ? 'font-semibold text-green-700' : ''}
                          >
                            {opt.text}
                            {opt.is_correct && ' (bonne réponse)'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
