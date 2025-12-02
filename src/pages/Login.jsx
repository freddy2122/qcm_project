import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const u = await login(email, password)
      if (u?.is_admin) {
        nav('/admin')
      } else {
        nav('/')
      }
    } catch {
      setError('Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={onSubmit} className="bg-white w-full max-w-sm p-6 rounded shadow space-y-4">
        <h1 className="text-xl font-semibold text-center">Connexion</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button disabled={loading} className="w-full bg-black text-white py-2 rounded">{loading ? '...' : 'Se connecter'}</button>
        <p className="text-sm text-center">Pas de compte ? <Link className="text-blue-600" to="/register">Inscription</Link></p>
      </form>
    </div>
  )
}
