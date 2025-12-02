import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import client from '../api/client'

export default function TeacherQuizResults() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | finished | running
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    async function fetchResults() {
      setLoading(true)
      setError('')
      try {
        const res = await client.get(`/teacher/quizzes/${id}/attempts`)
        if (!active) return
        setData(res.data)
      } catch (e) {
        if (!active) return
        setError("Impossible de charger les résultats pour ce QCM.")
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchResults()
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Chargement des résultats...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-sm text-red-600">{error}</div>
  if (!data) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Aucune donnée.</div>

  const filteredAttempts = data.attempts.filter((a) => {
    if (statusFilter === 'finished' && !a.is_finished) return false
    if (statusFilter === 'running' && a.is_finished) return false
    if (search) {
      const q = search.toLowerCase()
      if (!a.user.name.toLowerCase().includes(q) && !a.user.email.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Résultats du QCM</h1>
          <p className="text-sm text-gray-500">{data.quiz?.title}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="finished">Terminés</option>
            <option value="running">En cours</option>
          </select>
          <input
            className="border rounded px-3 py-1 text-sm flex-1 min-w-[180px]"
            placeholder="Rechercher un étudiant (nom ou email)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="text-sm text-gray-500">Aucune tentative pour ce QCM pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="py-2 pr-4">Étudiant</th>
                  <th className="py-2 pr-4 text-right">Score</th>
                  <th className="py-2 pr-4 text-right">Statut</th>
                  <th className="py-2 pr-4 text-right">Début</th>
                  <th className="py-2 pr-0 text-right">Fin</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 pr-4 align-top">
                      <div className="font-medium text-gray-900 truncate">{a.user.name}</div>
                      <div className="text-xs text-gray-500 truncate">{a.user.email}</div>
                    </td>
                    <td className="py-2 pr-4 align-top text-right">
                      <span className="inline-flex items-center justify-end gap-1 font-semibold">
                        {a.score}
                        <span className="text-gray-400 text-xs">/ {a.total}</span>
                      </span>
                    </td>
                    <td className="py-2 pr-4 align-top text-right">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.is_finished
                            ? 'bg-green-50 text-green-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {a.is_finished ? 'Terminé' : 'En cours'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 align-top text-right text-xs text-gray-500 whitespace-nowrap">
                      {a.started_at ?? '-'}
                    </td>
                    <td className="py-2 pr-0 align-top text-right text-xs text-gray-500 whitespace-nowrap">
                      {a.finished_at ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
