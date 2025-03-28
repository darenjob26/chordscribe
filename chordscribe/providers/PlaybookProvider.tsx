import React, { createContext, useContext, useState, useEffect } from 'react';
import { Playbook, CreatePlaybookInput, Song } from '../types/playbook';
import * as playbookService from '../services/playbookService';
import { useAuth } from './auth-provider';

interface PlaybookContextType {
  playbooks: Playbook[];
  currentPlaybook: Playbook | null;
  isLoading: boolean;
  error: string | null;
  createPlaybook: (name: string, description?: string) => Promise<void>;
  updatePlaybook: (id: string, updates: Partial<Playbook>) => Promise<void>;
  deletePlaybook: (id: string) => Promise<void>;
  setCurrentPlaybook: (playbook: Playbook | null) => void;
  addSongToPlaybook: (playbookId: string, songId: string) => Promise<void>;
  removeSongFromPlaybook: (playbookId: string, songId: string) => Promise<void>;
}

const PlaybookContext = createContext<PlaybookContextType | undefined>(undefined);

export const usePlaybook = () => {
  const context = useContext(PlaybookContext);
  if (!context) {
    throw new Error('usePlaybook must be used within a PlaybookProvider');
  }
  return context;
};

export const PlaybookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [currentPlaybook, setCurrentPlaybook] = useState<Playbook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlaybooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedPlaybooks = await playbookService.getPlaybooks();
      setPlaybooks(fetchedPlaybooks);

      // If no playbooks exist, create a default one
      if (fetchedPlaybooks.length === 0) {
        console.log('Creating default playbook');
        const defaultPlaybookInput: CreatePlaybookInput = {
          userId: user?.uid || '',
          name: 'My Songs',
          description: 'Your default song collection',
          songs: []
        };
        const defaultPlaybook = await playbookService.createPlaybook(defaultPlaybookInput);
        setPlaybooks([defaultPlaybook]);
        setCurrentPlaybook(defaultPlaybook);
      } else if (!currentPlaybook) {
        // If we have playbooks but no current selection, select the first one
        setCurrentPlaybook(fetchedPlaybooks[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch playbooks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // playbookService.deleteAllPlaybooks();
    // deletePlaybook("67e6d2a8c01c8412976bd665")
    console.log('Fetching playbooks');
    fetchPlaybooks();
  }, []);

  const createPlaybook = async (name: string, description?: string) => {
    try {
      setError(null);
      const newPlaybookInput: CreatePlaybookInput = {
        userId: user?.uid || '',
        name,
        description,
        songs: []
      };
      const newPlaybook = await playbookService.createPlaybook(newPlaybookInput);
      setPlaybooks(prev => [...prev, newPlaybook]);
      setCurrentPlaybook(newPlaybook);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playbook');
      throw err;
    }
  };

  const updatePlaybook = async (id: string, updates: Partial<Playbook>) => {
    try {
      setError(null);
      const updatedPlaybook = await playbookService.updatePlaybook(id, updates);
      setPlaybooks(prev =>
        prev.map(pb => pb._id === id ? updatedPlaybook : pb)
      );
      if (currentPlaybook?._id === id) {
        setCurrentPlaybook(updatedPlaybook);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update playbook');
      throw err;
    }
  };

  const deletePlaybook = async (id: string) => {
    try {
      setError(null);
      await playbookService.deletePlaybook(id);
      setPlaybooks(prev => prev.filter(pb => pb._id !== id));
      if (currentPlaybook?._id === id) {
        setCurrentPlaybook(playbooks.length > 1 ? playbooks[0] : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete playbook');
      throw err;
    }
  };

  const addSongToPlaybook = async (playbookId: string, songId: string) => {
    try {
      setError(null);
      const playbook = playbooks.find(pb => pb._id === playbookId);
      if (!playbook) throw new Error('Playbook not found');

      const updatedPlaybook = await playbookService.updatePlaybook(playbookId, {
        songs: [...playbook.songs, songId]
      });

      setPlaybooks(prev =>
        prev.map(pb => pb._id === playbookId ? updatedPlaybook : pb)
      );
      if (currentPlaybook?._id === playbookId) {
        setCurrentPlaybook(updatedPlaybook);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add song to playbook');
      throw err;
    }
  };

  const removeSongFromPlaybook = async (playbookId: string, songId: string) => {
    try {
      setError(null);
      const playbook = playbooks.find(pb => pb._id === playbookId);
      if (!playbook) throw new Error('Playbook not found');

      const updatedPlaybook = await playbookService.updatePlaybook(playbookId, {
        songs: playbook.songs.filter(id => id !== songId)
      });

      setPlaybooks(prev =>
        prev.map(pb => pb._id === playbookId ? updatedPlaybook : pb)
      );
      if (currentPlaybook?._id === playbookId) {
        setCurrentPlaybook(updatedPlaybook);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove song from playbook');
      throw err;
    }
  };

  const value = {
    playbooks,
    currentPlaybook,
    isLoading,
    error,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
    setCurrentPlaybook,
    addSongToPlaybook,
    removeSongFromPlaybook
  };

  return (
    <PlaybookContext.Provider value={value}>
      {children}
    </PlaybookContext.Provider>
  );
}; 