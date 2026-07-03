import { useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const WS_URL = import.meta.env.VITE_WS_URL;
const MAX_BACKOFF_MS = 30000;

const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const socket = useRef(null);
  const reconnectTimeout = useRef(null);
  const backoffMs = useRef(1000);
  const unmounted = useRef(false);

  const getUserId = useCallback(() => {
    return user?.id || user?._id || user?.spotifyId || null;
  }, [user]);

  const subscribe = useCallback((ws) => {
    const userId = getUserId();
    if (userId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', userId }));
    }
  }, [getUserId]);

  const connect = useCallback(() => {
    if (unmounted.current) return;
    if (!WS_URL) return;

    // Close any existing socket cleanly
    if (socket.current) {
      socket.current.onclose = null; // prevent reconnect loop
      socket.current.close();
      socket.current = null;
    }

    const ws = new WebSocket(WS_URL);
    socket.current = ws;

    ws.onopen = () => {
      if (unmounted.current) { ws.close(); return; }
      setIsConnected(true);
      backoffMs.current = 1000; // reset backoff on successful connect
      subscribe(ws);
    };

    ws.onclose = () => {
      if (unmounted.current) return;
      setIsConnected(false);
      socket.current = null;

      // Exponential backoff reconnect
      reconnectTimeout.current = setTimeout(() => {
        if (!unmounted.current) connect();
      }, backoffMs.current);
      backoffMs.current = Math.min(backoffMs.current * 2, MAX_BACKOFF_MS);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Dispatch global custom event for page-level components
        window.dispatchEvent(new CustomEvent('ws-message', { detail: data }));

        switch (data.type) {
          case 'connection':
            toast.success(data.message, { id: 'ws-connected', duration: 2000 });
            break;
          case 'mood_update':
            toast.info(`New mood: ${data.mood}`, { id: 'mood-update', duration: 2000 });
            break;
          case 'playlist_analyzed':
            toast.success('Playlist analysis finished!', { id: 'playlist-done' });
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
            break;
        }
      } catch (parseErr) {
        // Ignore malformed messages
      }
    };

    ws.onerror = () => {
      // onerror is always followed by onclose — let onclose handle reconnect
    };
  }, [subscribe]);

  useEffect(() => {
    unmounted.current = false;
    connect();

    return () => {
      unmounted.current = true;
      clearTimeout(reconnectTimeout.current);
      if (socket.current) {
        socket.current.onclose = null; // suppress reconnect on intentional close
        socket.current.close();
        socket.current = null;
      }
    };
  }, []); // connect once on mount

  // Re-subscribe if user changes (e.g. login after mount)
  useEffect(() => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      subscribe(socket.current);
    }
  }, [user, subscribe]);

  const sendMessage = useCallback((message) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    }
  }, []);

  return { isConnected, sendMessage };
};

export { useSocket };