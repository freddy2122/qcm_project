import axios from 'axios'

const client = axios.create({
  // On pointe directement sur les routes API Laravel
  baseURL: 'https://qcm.reussiratoutprix.com/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token d'authentification
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Gestion des erreurs
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Rediriger vers la page de connexion si non authentifié
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
