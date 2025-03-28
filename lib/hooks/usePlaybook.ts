import { useState, useEffect, useCallback } from 'react';
import { PlaybookService } from '../services/playbook-service';
import { IPlaybook, ISong } from '../models';
import { connectToDatabase, isConnectedToDatabase } from '../database';

// Helper function to safely get ID string
const getIdString = (doc: any): string => {
  if (!doc || !doc._id) return '';
  return doc._id.toString ? doc._id.toString() : String(doc._id);
};

// Hook for managing playbooks
export const usePlaybook = () => {
  const [playbooks, setPlaybooks] = useState<IPlaybook[]>([]);
  const [currentPlaybook, setCurrentPlaybook] = useState<IPlaybook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all playbooks
  const loadPlaybooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure we're connected to MongoDB
      if (!isConnectedToDatabase()) {
        await connectToDatabase();
      }
      
      const allPlaybooks = await PlaybookService.getAllPlaybooks();
      setPlaybooks(allPlaybooks);
      
      // Set the first playbook as current if none selected
      if (!currentPlaybook && allPlaybooks.length > 0) {
        setCurrentPlaybook(allPlaybooks[0]);
      }
    } catch (err) {
      console.error('Error loading playbooks:', err);
      setError('Failed to load playbooks');
    } finally {
      setLoading(false);
    }
  }, [currentPlaybook]);

  // Load a specific playbook by ID
  const loadPlaybook = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const playbook = await PlaybookService.getPlaybookById(id);
      
      if (playbook) {
        setCurrentPlaybook(playbook);
        return playbook;
      } else {
        setError(`Playbook with ID ${id} not found`);
        return null;
      }
    } catch (err) {
      console.error(`Error loading playbook ${id}:`, err);
      setError('Failed to load playbook');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new playbook
  const createPlaybook = useCallback(async (data: Partial<IPlaybook>) => {
    setLoading(true);
    setError(null);
    try {
      const newPlaybook = await PlaybookService.createPlaybook(data);
      setPlaybooks(prev => [...prev, newPlaybook]);
      setCurrentPlaybook(newPlaybook);
      return newPlaybook;
    } catch (err) {
      console.error('Error creating playbook:', err);
      setError('Failed to create playbook');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a playbook
  const updatePlaybook = useCallback(async (id: string, data: Partial<IPlaybook>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlaybook = await PlaybookService.updatePlaybook(id, data);
      
      if (updatedPlaybook) {
        setPlaybooks(prev => 
          prev.map(p => getIdString(p) === id ? updatedPlaybook : p)
        );
        
        if (currentPlaybook && getIdString(currentPlaybook) === id) {
          setCurrentPlaybook(updatedPlaybook);
        }
        
        return updatedPlaybook;
      } else {
        setError(`Playbook with ID ${id} not found`);
        return null;
      }
    } catch (err) {
      console.error(`Error updating playbook ${id}:`, err);
      setError('Failed to update playbook');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentPlaybook]);

  // Delete a playbook
  const deletePlaybook = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await PlaybookService.deletePlaybook(id);
      
      if (success) {
        setPlaybooks(prev => prev.filter(p => getIdString(p) !== id));
        
        if (currentPlaybook && getIdString(currentPlaybook) === id) {
          const remainingPlaybooks = playbooks.filter(p => getIdString(p) !== id);
          setCurrentPlaybook(remainingPlaybooks.length > 0 ? remainingPlaybooks[0] : null);
        }
        
        return true;
      } else {
        setError(`Playbook with ID ${id} not found`);
        return false;
      }
    } catch (err) {
      console.error(`Error deleting playbook ${id}:`, err);
      setError('Failed to delete playbook');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentPlaybook, playbooks]);

  // Add a song to current playbook
  const addSong = useCallback(async (playbookId: string, songData: Partial<ISong>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlaybook = await PlaybookService.addSongToPlaybook(playbookId, songData);
      
      if (updatedPlaybook) {
        setPlaybooks(prev => 
          prev.map(p => getIdString(p) === playbookId ? updatedPlaybook : p)
        );
        
        if (currentPlaybook && getIdString(currentPlaybook) === playbookId) {
          setCurrentPlaybook(updatedPlaybook);
        }
        
        return updatedPlaybook;
      } else {
        setError(`Failed to add song to playbook ${playbookId}`);
        return null;
      }
    } catch (err) {
      console.error(`Error adding song to playbook ${playbookId}:`, err);
      setError('Failed to add song');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentPlaybook]);

  // Update a song in current playbook
  const updateSong = useCallback(async (playbookId: string, songId: string, songData: Partial<ISong>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlaybook = await PlaybookService.updateSongInPlaybook(playbookId, songId, songData);
      
      if (updatedPlaybook) {
        setPlaybooks(prev => 
          prev.map(p => getIdString(p) === playbookId ? updatedPlaybook : p)
        );
        
        if (currentPlaybook && getIdString(currentPlaybook) === playbookId) {
          setCurrentPlaybook(updatedPlaybook);
        }
        
        return updatedPlaybook;
      } else {
        setError(`Failed to update song ${songId} in playbook ${playbookId}`);
        return null;
      }
    } catch (err) {
      console.error(`Error updating song ${songId} in playbook ${playbookId}:`, err);
      setError('Failed to update song');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentPlaybook]);

  // Delete a song from current playbook
  const deleteSong = useCallback(async (playbookId: string, songId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlaybook = await PlaybookService.deleteSongFromPlaybook(playbookId, songId);
      
      if (updatedPlaybook) {
        setPlaybooks(prev => 
          prev.map(p => getIdString(p) === playbookId ? updatedPlaybook : p)
        );
        
        if (currentPlaybook && getIdString(currentPlaybook) === playbookId) {
          setCurrentPlaybook(updatedPlaybook);
        }
        
        return true;
      } else {
        setError(`Failed to delete song ${songId} from playbook ${playbookId}`);
        return false;
      }
    } catch (err) {
      console.error(`Error deleting song ${songId} from playbook ${playbookId}:`, err);
      setError('Failed to delete song');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentPlaybook]);

  // Load playbooks on mount
  useEffect(() => {
    loadPlaybooks();
  }, [loadPlaybooks]);

  return {
    playbooks,
    currentPlaybook,
    loading,
    error,
    loadPlaybooks,
    loadPlaybook,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
    addSong,
    updateSong,
    deleteSong
  };
}; 