import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

const ReconnectButton = () => {
  const handleReconnect = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      toast.error('API URL not configured. Please check your environment settings.');
      return;
    }
    
    const loginUrl = `${apiUrl}/auth/login`;
    console.log('Reconnecting via:', loginUrl);
    window.location.href = loginUrl;
  };

  return (
    <Button onClick={handleReconnect} variant="destructive" size="sm">
      Reconnect Spotify
    </Button>
  );
};

export default ReconnectButton;