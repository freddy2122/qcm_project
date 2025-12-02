import { useEffect, useState } from 'react'
import client from '../api/client'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchUsers() {
    setLoading(true)
    setError('')
    try {
      const { data } = await client.get('/admin/users')
      setUsers(data)
    } catch (e) {
      setError("Impossible de charger la liste des utilisateurs.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  async function toggleTeacher(userId, current) {
    setError('')
    try {
      await client.patch(`/admin/users/${userId}/role`, { is_teacher: !current })
      await fetchUsers()
    } catch (e) {
      setError("Impossible de mettre à jour le rôle de l'utilisateur.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-500">Attribuez le rôle professeur aux comptes qui doivent pouvoir créer des QCM.</p>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="text-sm text-gray-500">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="text-sm text-gray-500">Aucun utilisateur à afficher.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="py-2 pr-4">Nom</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4 text-right">Rôle professeur</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 pr-4 align-top">
                      <div className="font-medium text-gray-900 truncate">{u.name}</div>
                    </td>
                    <td className="py-2 pr-4 align-top text-sm text-gray-700 truncate">{u.email}</td>
                    <td className="py-2 pr-4 align-top text-right">
                      <button
                        type="button"
                        onClick={() => toggleTeacher(u.id, u.is_teacher)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                          u.is_teacher
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {u.is_teacher ? 'Professeur' : 'Étudiant'}
                      </button>
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
