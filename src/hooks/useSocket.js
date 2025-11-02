import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    // Get WebSocket URL from environment
    const wsUrl = import.meta.env.VITE_WS_URL;
    
    if (!socket.current) {
      console.log('Connecting to WebSocket:', wsUrl);
      socket.current = new WebSocket(wsUrl);

      socket.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
      };

      socket.current.onclose = () => {
        console.log('❌ WebSocket disconnected');
        setIsConnected(false);
      };

      socket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 WS message received:', data);

        // Handle real-time updates
        switch (data.type) {
          case 'connection':
            toast.success(data.message);
            break;
          case 'mood_update':
            toast.info(`New mood update: ${data.mood}`);
            break;
          case 'playlist_analyzed':
            toast.success('Playlist analysis finished!');
            break;
          case 'transfer_progress':
            toast.loading(`Transferring: ${data.song}...`, { id: 'transfer' });
            break;
          case 'transfer_complete':
            toast.success('Transfer complete!', { id: 'transfer' });
            break;
          case 'transfer_error':
            toast.error('Transfer failed', { id: 'transfer' });
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      };

      socket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Don't show error toast on connection attempts
      };
    }

    return () => {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.close();
      }
    };
  }, []);

  const sendMessage = (message) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, sendMessage };
};

export { useSocket };