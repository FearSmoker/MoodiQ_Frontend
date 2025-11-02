import { create } from 'zustand';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const usePlaylistStore = create((set, get) => ({
  playlists: [],
  selectedPlaylist: null,
  moodData: null,
  loading: false,
  error: null,

  // Fetch user's playlists
  fetchPlaylists: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/playlists');
      set({ 
        playlists: data.playlists || data,
        loading: false 
      });
    } catch (e) {
      console.error('Failed to fetch playlists:', e);
      set({ 
        error: e.response?.data?.message || 'Failed to fetch playlists',
        loading: false 
      });
    }
  },

  // Analyze playlist mood
  analyzePlaylist: async (playlistId) => {
    set({ loading: true, moodData: null, error: null });
    const toastId = toast.loading('Analyzing playlist mood...');
    
    try {
      const { data } = await api.post('/playlists/mood', { playlistId });
      set({ 
        moodData: data,
        loading: false 
      });
      toast.success('Analysis complete!', { id: toastId });
      return data;
    } catch (e) {
      console.error('Failed to analyze playlist:', e);
      const errorMsg = e.response?.data?.message || 'Failed to analyze playlist';
      set({ 
        error: errorMsg,
        loading: false 
      });
      toast.error(errorMsg, { id: toastId });
      throw e;
    }
  },

  // Get specific playlist details
  getPlaylist: async (playlistId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/playlists/${playlistId}`);
      set({ 
        selectedPlaylist: data,
        loading: false 
      });
      return data;
    } catch (e) {
      console.error('Failed to fetch playlist:', e);
      set({ 
        error: e.response?.data?.message || 'Failed to fetch playlist',
        loading: false 
      });
      throw e;
    }
  },

  // Optimize playlist flow
  optimizeFlow: async (tracks, startMood, endMood) => {
    const toastId = toast.loading('Optimizing playlist flow...');
    try {
      const { data } = await api.post('/playlists/optimize', {
        tracks,
        startMood,
        endMood,
        algorithm: 'dynamic_programming'
      });
      toast.success('Flow optimized!', { id: toastId });
      return data;
    } catch (e) {
      console.error('Failed to optimize flow:', e);
      toast.error('Optimization failed', { id: toastId });
      throw e;
    }
  },

  // Get recommendations
  getRecommendations: async (params) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/playlists/recommendations', params);
      set({ loading: false });
      return data;
    } catch (e) {
      console.error('Failed to get recommendations:', e);
      set({ 
        error: e.response?.data?.message || 'Failed to get recommendations',
        loading: false 
      });
      throw e;
    }
  },

  // Create new playlist
  createPlaylist: async (name, trackUris, description = '', isPublic = true) => {
    const toastId = toast.loading('Creating playlist...');
    try {
      const { data } = await api.post('/playlists/create', {
        name,
        trackUris,
        description,
        isPublic
      });
      toast.success('Playlist created!', { id: toastId });
      
      // Refresh playlists
      get().fetchPlaylists();
      
      return data;
    } catch (e) {
      console.error('Failed to create playlist:', e);
      toast.error('Failed to create playlist', { id: toastId });
      throw e;
    }
  },

  // Reorder playlist
  reorderPlaylist: async (playlistId, trackUris) => {
    const toastId = toast.loading('Reordering playlist...');
    try {
      const { data } = await api.put(`/playlists/${playlistId}/reorder`, {
        trackUris
      });
      toast.success('Playlist reordered!', { id: toastId });
      return data;
    } catch (e) {
      console.error('Failed to reorder playlist:', e);
      toast.error('Failed to reorder playlist', { id: toastId });
      throw e;
    }
  },

  // Clear mood data
  clearMoodData: () => {
    set({ moodData: null });
  },

  // Set selected playlist
  setSelectedPlaylist: (playlist) => set({ selectedPlaylist: playlist }),
}));