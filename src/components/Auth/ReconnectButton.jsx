import { Button } from '../ui/Button';

const ReconnectButton = () => {
  const handleReconnect = () => {
    // VITE_API_URL = https://moodiq-backend.onrender.com/api
    // We need: https://moodiq-backend.onrender.com/api/auth/login
    const apiUrl = import.meta.env.VITE_API_URL;
    const loginUrl = `${apiUrl}/auth/login`;
    window.location.href = loginUrl;
  };

  return (
    <Button onClick={handleReconnect} variant="destructive" size="sm">
      Reconnect Spotify
    </Button>
  );
};

export default ReconnectButton;