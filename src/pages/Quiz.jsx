import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'

export default function Quiz() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [position, setPosition] = useState(0)
  const [total, setTotal] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [slugStatus, setSlugStatus] = useState(slug ? 'ready' : 'resolving')
  const [slugError, setSlugError] = useState('')
  const forfeitLock = useRef(false)
  const lastPosition = useRef(0)

  const basePath = slug ? `/quizzes/${slug}` : '/quiz'
  const attemptPath = slug ? `/quizzes/${slug}/attempt` : '/attempts/me'

  useEffect(() => {
    if (slug) {
      setSlugStatus('ready')
      return
    }
    if (slugStatus !== 'resolving') return
    let active = true
    client.get('/quizzes')
      .then(({ data }) => {
        if (!active) return
        if (data.length) {
          navigate(`/quiz/${data[0].slug}`, { replace: true })
        } else {
          setSlugError('Aucun QCM disponible.')
          setSlugStatus('error')
          setLoading(false)
        }
      })
      .catch(() => {
        if (!active) return
        setSlugError('Impossible de charger les QCM.')
        setSlugStatus('error')
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug, slugStatus, navigate])

  const loadCurrent = useCallback(async () => {
    const res = await client.get(`${basePath}/current`)
    if (res.data.finished) {
      setFinished(true)
    } else {
      setFinished(false)
      setPosition(res.data.position)
      setTotal(res.data.total)
      setTimeLeft(res.data.time_left)
      setQuestion(res.data.question)
      setSelected(null)
      forfeitLock.current = false
      lastPosition.current = res.data.position
    }
    setLoading(false)
  }, [basePath])

  const start = useCallback(async () => {
    await client.post(`${basePath}/start`)
    await loadCurrent()
  }, [basePath, loadCurrent])

  useEffect(() => {
    if (slugStatus !== 'ready') return
    start()
  }, [start, slugStatus])

  useEffect(() => {
    if (finished) return
    const t = setInterval(() => {
      setTimeLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [finished, position])

  const forfeit = useCallback(async () => {
    if (forfeitLock.current) return
    forfeitLock.current = true
    try {
      const res = await client.post(`${basePath}/answer`, { forfeit: true })
      if (res.data.finished) {
        setFinished(true)
        return
      }
      await loadCurrent()
    } finally {
      forfeitLock.current = false
    }
  }, [basePath, loadCurrent])

  useEffect(() => {
    if (!finished && timeLeft === 0 && question) {
      forfeit()
    }
  }, [timeLeft, finished, question, forfeit])

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        if (lastPosition.current === position) forfeit()
      }
    }
    function onBlur() {
      if (lastPosition.current === position) forfeit()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
    }
  }, [position, forfeit])

  async function submit() {
    if (selected == null) return
    try {
      const res = await client.post(`${basePath}/answer`, { option_ids: [selected] })
      if (res.data.finished) {
        setFinished(true)
        return
      }
      await loadCurrent()
    } catch (error) {
      if (error.response?.status === 422) {
        // Par exemple: tentative déjà terminée côté backend
        setFinished(true)
        return
      }
      throw error
    }
  }

  if (slugStatus === 'resolving') return <div className="p-6 text-center">Préparation du QCM...</div>
  if (slugStatus === 'error') return <div className="p-6 text-center text-red-600">{slugError}</div>
  if (loading) return <div className="p-6 text-center">Chargement...</div>
  if (finished) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight">Bravo, vous avez terminé le QCM</h1>
          <p className="text-sm text-gray-500">
            Chaque bonne réponse vaut <span className="font-medium">1 point</span>, sur un total de {total} questions.
            <br />Vous allez être automatiquement redirigé vers votre tableau de bord dans quelques secondes.
          </p>
          <Result attemptPath={attemptPath} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-400">Session QCM</p>
            <div className="flex items-baseline gap-2 text-sm text-gray-600">
              <p>
                Question <span className="font-semibold">{position}</span> / {total}
              </p>
              {total > 0 && (
                <span className="text-xs text-gray-400">
                  {Math.round((position / total) * 100)}%
                </span>
              )}
            </div>
            <div className="mt-1 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-indigo-500 transition-all"
                style={{ width: `${total ? Math.min(100, Math.max(0, (position / total) * 100)) : 0}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">Temps restant</span>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-semibold">
                  {timeLeft}s
                </div>
              </div>
            </div>
            <div
              className="text-xs text-gray-400 max-w-[180px] cursor-help"
              title="Chaque question est limitée à 20 secondes. Si vous changez d onglet ou quittez la page, la question est automatiquement annulée."
            >
              Anti-triche activé : ne quittez pas cet onglet.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-lg font-medium text-gray-900 leading-relaxed">
            {question.text}
          </div>

          <div className="space-y-2">
            {question.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selected === opt.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="opt"
                  checked={selected === opt.id}
                  onChange={() => setSelected(opt.id)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-800">{opt.text}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t mt-2 gap-3 flex-wrap">
          <div className="text-xs text-gray-400">
            20 questions &bull; 1 point par question &bull; changement d onglet = question annulée
          </div>
          <div className="flex gap-2">
            <button
              onClick={submit}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-40"
              disabled={selected == null}
            >
              Valider la réponse
            </button>
            <button
              onClick={forfeit}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Passer (0 point)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Result({ attemptPath }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    let active = true
    client.get(attemptPath)
      .then((r) => {
        if (active) setData(r.data)
      })
      .catch(() => {
        if (active) setData(null)
      })
    return () => {
      active = false
    }
  }, [attemptPath])
  if (!data) return <div className="text-sm text-gray-500">Chargement du récapitulatif...</div>

  return (
    <div className="space-y-4 text-left">
      <div className="text-lg font-semibold">Score : {data.score} / {data.total}</div>
      <div className="text-xs text-gray-500">Détail de vos réponses :</div>
      <div className="space-y-3 max-h-80 overflow-y-auto text-left">
        {data.answers.map((a, i) => (
          <div key={i} className="rounded-lg border px-3 py-2 text-sm bg-gray-50/80">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Q{a.position}</span>
              <span
                className={
                  a.is_forfeit
                    ? 'text-gray-500'
                    : a.is_correct
                      ? 'text-green-600'
                      : 'text-red-600'
                }
              >
                {a.is_forfeit ? 'Forfait' : a.is_correct ? 'Juste' : 'Faux'}
              </span>
              <span className="text-gray-500 text-xs">{a.points} pt</span>
            </div>

            {a.question && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-700">{a.question.text}</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  {a.question.options.map((opt) => {
                    const selected = a.selected_option_ids?.includes(opt.id)
                    const correct = opt.is_correct

                    let className = 'text-gray-700'
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
    </div>
  )
}
