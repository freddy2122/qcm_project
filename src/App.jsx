import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AdminRoute from './auth/AdminRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Quiz from './pages/Quiz'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import AdminUsers from './pages/AdminUsers'
import TeacherQuizzes from './pages/TeacherQuizzes'
import TeacherQuizQuestions from './pages/TeacherQuizQuestions'
import TeacherQuizResults from './pages/TeacherQuizResults'
import SiteHeader from './components/SiteHeader'
import Home from './pages/Home'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/:slug" element={<Quiz />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
            <Route path="/teacher/quizzes/:id/questions" element={<TeacherQuizQuestions />} />
            <Route path="/teacher/quizzes/:id/results" element={<TeacherQuizResults />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
