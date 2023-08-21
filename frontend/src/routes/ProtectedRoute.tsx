import { FC } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute: FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { isAuth, loading } = useAuth();  
    if (!isAuth && !loading)
      return <Navigate to="/login" replace />;
  
    return (<>{children}</>);
};

export default ProtectedRoute;