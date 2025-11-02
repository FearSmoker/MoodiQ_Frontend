import { Button } from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ReconnectButton = () => {
  const handleReconnect = () => {
    // Re-run the full auth flow
    window.location.href = `${API_URL}/auth/login`;
  };

  return (
    <Button onClick={handleReconnect} variant="destructive" size="sm">
      Reconnect Spotify
    </Button>
  );
};

export default ReconnectButton;