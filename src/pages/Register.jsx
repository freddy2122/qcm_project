import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password_confirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const u = await register(name, email, password, password_confirmation)
      if (u?.is_admin) {
        nav('/admin')
      } else {
        nav('/')
      }
    } catch {
      setError('Inscription échouée')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={onSubmit} className="bg-white w-full max-w-sm p-6 rounded shadow space-y-4">
        <h1 className="text-xl font-semibold text-center">Inscription</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input className="w-full border rounded px-3 py-2" placeholder="Nom" value={name} onChange={e=>setName(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Confirmer le mot de passe" type="password" value={password_confirmation} onChange={e=>setPasswordConfirmation(e.target.value)} required />
        <button disabled={loading} className="w-full bg-black text-white py-2 rounded">{loading ? '...' : "S'inscrire"}</button>
        <p className="text-sm text-center">Déjà un compte ? <Link className="text-blue-600" to="/login">Connexion</Link></p>
      </form>
    </div>
  )
}
