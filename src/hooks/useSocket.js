import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    if (!socket.current) {
      socket.current = new WebSocket(WS_URL);

      socket.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      socket.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

      socket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WS message received:', data);

        // Handle real-time updates
        switch (data.type) {
          case 'connection':
            toast.success(data.message);
            break;
          case 'mood_update':
            // TODO: Update a live dashboard
            toast.info(`New mood update: ${data.mood}`);
            break;
          case 'playlist_analyzed':
            toast.success(`Playlist analysis finished!`);
            // TODO: Optionally trigger a refetch or update state
            break;
          case 'transfer_progress':
            toast.loading(`Transferring: ${data.song}...`, { id: 'transfer' });
            break;
        }
      };

      socket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Real-time connection failed.');
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