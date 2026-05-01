import { createBrowserRouter } from 'react-router'
import Login from '../features/auth/pages/Login.jsx'
import Register from '../features/auth/pages/Register.jsx'
import Dashboard from '../features/chat/pages/Dashboard.jsx'
import PublicOnlyRoute from './PublicOnlyRoute.jsx'
import { Navigate } from 'react-router'



export const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <Register />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/dashboard',
    element: <Navigate to="/" replace />,
  },
])
