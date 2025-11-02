import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

const Navbar = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Moodify-AI
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/optimize" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Optimize</Link>
          <ThemeToggle />
          <Button onClick={logout} variant="secondary" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;