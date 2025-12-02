import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function Admin() {
  const [items, setItems] = useState([])
  const navigate = useNavigate()
  useEffect(() => {
    client.get('/admin/attempts').then(r => setItems(r.data)).catch(()=>setItems([]))
  }, [])
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-8 space-y-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Espace administrateur</h1>
            <p className="text-sm text-gray-500">
              Vous êtes connecté en tant qu administrateur. Cette interface est réservée à la gestion des QCM
              et au suivi des résultats des apprenants et des professeurs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 rounded-lg text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Gestion des utilisateurs
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="mt-4">
            <h2 className="text-lg font-semibold tracking-tight">Résultats QCM</h2>
            <p className="text-sm text-gray-500">Liste des apprenants inscrits et de leurs résultats au QCM.</p>
          </div>
          <div className="text-xs text-gray-400">
            {items.length} tentative{items.length > 1 ? 's' : ''}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="py-2 pr-4">Apprenant</th>
                <th className="py-2 pr-4">Quiz</th>
                <th className="py-2 pr-4 text-right">Score</th>
                <th className="py-2 pr-4 text-right">Statut</th>
                <th className="py-2 pr-4 text-right">Début</th>
                <th className="py-2 pr-0 text-right">Fin</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 pr-4 align-top">
                    <div className="font-medium text-gray-900 truncate">{a.user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{a.user.email}</div>
                  </td>
                  <td className="py-2 pr-4 align-top text-gray-700">{a.quiz.title}</td>
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
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                    Aucune tentative pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
