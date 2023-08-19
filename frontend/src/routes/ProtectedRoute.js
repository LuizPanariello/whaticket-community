import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const ProtectedRoute = ({ children }) => {
    const { isAuth, loading } = useAuth();  
    if (!isAuth && !loading)
      return <Navigate to="/login" replace />;
  
    return (children);
};

export default ProtectedRoute;