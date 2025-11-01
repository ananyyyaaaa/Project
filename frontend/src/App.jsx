import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WorkProgress from './pages/WorkProgress.jsx'
import Employment from './pages/Employment.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard/:district" element={<Dashboard />} />
        <Route path="/work-progress/:district" element={<WorkProgress />} />
        <Route path="/employment/:district" element={<Employment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
