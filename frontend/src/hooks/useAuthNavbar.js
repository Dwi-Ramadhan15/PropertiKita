import { useNavigate } from 'react-router-dom';

export default function useAuthNavbar() {
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

const getDashboardLink = () => {
  if (!user) return '/login';
  const role = user.role?.toLowerCase();
  if (role === 'admin') return '/dashboard-admin';
  if (role === 'agen') return '/dashboard-agen';
  return '/dashboard-user';
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return {
    user,
    getDashboardLink,
    handleLogout
  };
}