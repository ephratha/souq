
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
  // Mock auth check - replace with actual auth logic
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default PrivateRoute;