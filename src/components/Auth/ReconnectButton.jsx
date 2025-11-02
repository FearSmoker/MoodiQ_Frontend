import { Button } from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ReconnectButton = () => {
  const handleReconnect = () => {
    // Remove /api from the URL since VITE_API_URL already includes it
    const baseUrl = API_URL.replace('/api', '');
    window.location.href = `${baseUrl}/api/auth/login`;
  };

  return (
    <Button onClick={handleReconnect} variant="destructive" size="sm">
      Reconnect Spotify
    </Button>
  );
};

export default ReconnectButton;