import { useEffect, useState, useCallback } from 'react';
import { PlaybookService } from '../services/playbook-service';
import { connectToDatabase, isConnectedToDatabase } from '../database';
import { IPlaybook, ISong } from '../models';
import { Types } from 'mongoose';

export function usePlaybookDB() {
  const [playbooks, setPlaybooks] = useState<IPlaybook[]>([]);
  const [currentPlaybook, setCurrentPlaybook] = useState<IPlaybook | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  // Load playbooks on initial render
  useEffect(() => {
    loadPlaybooks();
    
    // Try to connect to DB
    connectToDatabase().then(() => {
      setIsOnline(isConnectedToDatabase());
    });
    
    // Setup connection status check interval
    const interval = setInterval(() => {
      setIsOnline(isConnectedToDatabase());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Load all playbooks
  const loadPlaybooks = async () => {
    setIsLoading(true);
    try {
      const data = await PlaybookService.getAllPlaybooks();
      setPlaybooks(data);
      setError(null);
    } catch (err) {
      console.error('Error loading playbooks:', err);
      setError('Failed to load playbooks');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new playbook
  const createPlaybook = useCallback(async (name: string, description?: string): Promise<IPlaybook | null> => {
    try {
      const newPlaybook = await PlaybookService.createPlaybook({ name, description });
      setPlaybooks(prev => [...prev, newPlaybook]);
      return newPlaybook;
    } catch (err) {
      console.error('Error creating playbook:', err);
      setError('Failed to create playbook');
      return null;
    }
  }, []);

  // Update an existing playbook
  const updatePlaybook = useCallback(async (id: string, name?: string, description?: string): Promise<IPlaybook | null> => {
    try {
      const updatedData: Partial<IPlaybook> = {};
      if (name) updatedData.name = name;
      if (description !== undefined) updatedData.description = description;
      
      const updated = await PlaybookService.updatePlaybook(id, updatedData);
      
      if (updated) {
        setPlaybooks(prev => prev.map(p => (p._id as Types.ObjectId).toString() === id ? updated : p));
        if (currentPlaybook && (currentPlaybook._id as Types.ObjectId).toString() === id) {
          setCurrentPlaybook(updated);
        }
      }
      
      return updated;
    } catch (err) {
      console.error('Error updating playbook:', err);
      setError('Failed to update playbook');
      return null;
    }
  }, [currentPlaybook]);

  // Delete a playbook
  const deletePlaybook = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await PlaybookService.deletePlaybook(id);
      
      if (success) {
        setPlaybooks(prev => prev.filter(p => (p._id as Types.ObjectId).toString() !== id));
        if (currentPlaybook && (currentPlaybook._id as Types.ObjectId).toString() === id) {
          setCurrentPlaybook(null);
        }
      }
      
      return success;
    } catch (err) {
      console.error('Error deleting playbook:', err);
      setError('Failed to delete playbook');
      return false;
    }
  }, [currentPlaybook]);

  // Add a song to a playbook
  const addSongToPlaybook = useCallback(async (playbookId: string, song: Partial<ISong>): Promise<IPlaybook | null> => {
    try {
      const updatedPlaybook = await PlaybookService.addSongToPlaybook(playbookId, song);
      
      if (updatedPlaybook) {
        setPlaybooks(prev => prev.map(p => (p._id as Types.ObjectId).toString() === playbookId ? updatedPlaybook : p));
        if (currentPlaybook && (currentPlaybook._id as Types.ObjectId).toString() === playbookId) {
          setCurrentPlaybook(updatedPlaybook);
        }
      }
      
      return updatedPlaybook;
    } catch (err) {
      console.error('Error adding song to playbook:', err);
      setError('Failed to add song to playbook');
      return null;
    }
  }, [currentPlaybook]);

  // Update a song in a playbook
  const updateSongInPlaybook = useCallback(async (playbookId: string, songId: string, song: Partial<ISong>): Promise<IPlaybook | null> => {
    try {
      const updatedPlaybook = await PlaybookService.updateSongInPlaybook(playbookId, songId, song);
      
      if (updatedPlaybook) {
        setPlaybooks(prev => prev.map(p => (p._id as Types.ObjectId).toString() === playbookId ? updatedPlaybook : p));
        if (currentPlaybook && (currentPlaybook._id as Types.ObjectId).toString() === playbookId) {
          setCurrentPlaybook(updatedPlaybook);
        }
      }
      
      return updatedPlaybook;
    } catch (err) {
      console.error('Error updating song in playbook:', err);
      setError('Failed to update song in playbook');
      return null;
    }
  }, [currentPlaybook]);

  // Delete a song from a playbook
  const deleteSongFromPlaybook = useCallback(async (playbookId: string, songId: string): Promise<IPlaybook | null> => {
    try {
      const updatedPlaybook = await PlaybookService.deleteSongFromPlaybook(playbookId, songId);
      
      if (updatedPlaybook) {
        setPlaybooks(prev => prev.map(p => (p._id as Types.ObjectId).toString() === playbookId ? updatedPlaybook : p));
        if (currentPlaybook && (currentPlaybook._id as Types.ObjectId).toString() === playbookId) {
          setCurrentPlaybook(updatedPlaybook);
        }
      }
      
      return updatedPlaybook;
    } catch (err) {
      console.error('Error deleting song from playbook:', err);
      setError('Failed to delete song from playbook');
      return null;
    }
  }, [currentPlaybook]);

  // Manual sync with database
  const syncWithDatabase = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await PlaybookService.syncWithDatabase();
      if (success) {
        await loadPlaybooks();
      }
      return success;
    } catch (err) {
      console.error('Error syncing with database:', err);
      setError('Failed to sync with database');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    playbooks,
    currentPlaybook,
    setCurrentPlaybook,
    isLoading,
    error,
    isOnline,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
    addSongToPlaybook,
    updateSongInPlaybook,
    deleteSongFromPlaybook,
    syncWithDatabase,
    refreshPlaybooks: loadPlaybooks
  };
} 