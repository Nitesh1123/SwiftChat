import { useUser } from '@/context/useUser'
import { type JSX } from 'react'
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useUser();
  if (loading) return null;
  if (!user) {
    return <Navigate to={'/auth'} replace />
  }
  return children;
}

export default ProtectedRoute
