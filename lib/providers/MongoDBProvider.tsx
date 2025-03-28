import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectToDatabase, disconnectFromDatabase, isConnectedToDatabase, setMongoDBURI } from '../database';
import { usePlaybook } from '../hooks/usePlaybook';
import { IPlaybook, ISong } from '../models';
import { Alert, Platform } from 'react-native';
import mongooseConfig from '@/lib/mongodb-config';
import { Types } from 'mongoose';
import { Section } from '@/types/chord';

// Initialize database connection on app start - but don't block rendering
const initializeConnection = async () => {
  try {
    const connected = await connectToDatabase();
    console.log('Initial MongoDB connection result:', connected);
    return connected;
  } catch (error) {
    console.error('Failed to initialize MongoDB connection:', error);
    return false;
  }
};

// Start connection in background
initializeConnection().catch(err => {
  console.warn('MongoDB initial connection error (non-blocking):', err);
});

interface MongoDBContextType {
  // Connection status
  isConnected: boolean;
  connecting: boolean;
  connectionError: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  setCustomURI: (uri: string) => Promise<boolean>;
  reconnect: () => Promise<boolean>;
  isOnline: boolean;

  // Playbook operations
  playbooks: IPlaybook[];
  currentPlaybook: IPlaybook | null;
  isLoading: boolean;
  error: string | null;
  setCurrentPlaybook: (playbook: IPlaybook | null) => void;
  createPlaybook: (name: string, description?: string) => Promise<IPlaybook | null>;
  updatePlaybook: (id: string, name?: string, description?: string) => Promise<IPlaybook | null>;
  deletePlaybook: (id: string) => Promise<boolean>;
  
  // Songs
  addSongToPlaybook: (playbookId: string, song: Partial<ISong>) => Promise<IPlaybook | null>;
  updateSongInPlaybook: (playbookId: string, songId: string, song: Partial<ISong>) => Promise<IPlaybook | null>;
  deleteSongFromPlaybook: (playbookId: string, songId: string) => Promise<IPlaybook | null>;
  
  // Current Song operations
  sections: Section[];
  addSection: (section: Section) => void;
  updateSection: (section: Section) => void;
  deleteSection: (sectionId: string) => void;
  clearSections: () => void;
  
  // Sync
  syncWithDatabase: () => Promise<boolean>;
  refreshPlaybooks: () => Promise<void>;
}

// Create the context
const MongoDBContext = createContext<MongoDBContextType | undefined>(undefined);

// Helper function to safely get ID string
const getIdString = (doc: any): string => {
  if (!doc || !doc._id) return '';
  return doc._id.toString ? doc._id.toString() : String(doc._id);
};

// Provider component
export const MongoDBProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Use our playbook hook for MongoDB operations
  const {
    playbooks,
    currentPlaybook,
    loading: isLoading,
    error,
    loadPlaybooks,
    createPlaybook: createPlaybookBase,
    updatePlaybook: updatePlaybookBase,
    deletePlaybook: deletePlaybookBase,
    loadPlaybook,
    addSong,
    updateSong,
    deleteSong
  } = usePlaybook();

  // Internal state for current playbook
  const [selectedPlaybook, setSelectedPlaybook] = useState<IPlaybook | null>(null);

  // Sync selectedPlaybook with currentPlaybook from hook
  useEffect(() => {
    if (currentPlaybook) {
      setSelectedPlaybook(currentPlaybook);
    }
  }, [currentPlaybook]);

  // Set current playbook function
  const setCurrentPlaybook = (playbook: IPlaybook | null) => {
    setSelectedPlaybook(playbook);
  };

  // Initialize connection status on mount
  useEffect(() => {
    setIsConnected(isConnectedToDatabase());
  }, []);

  // Attempt reconnection if mongoose connection is closed
  useEffect(() => {
    const checkConnection = () => {
      if (mongooseConfig.connection && mongooseConfig.connection.readyState === 0) {
        console.log('MongoDB disconnected, attempting reconnect...');
        connectToDatabase().then(success => {
          setIsConnected(success);
        }).catch(err => {
          console.warn('Reconnection attempt failed:', err);
        });
      }
    };
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Connect to database
  const connect = async (): Promise<boolean> => {
    setConnecting(true);
    setConnectionError(null);
    
    try {
      const connectionSuccess = await connectToDatabase();
      setIsConnected(connectionSuccess);
      
      if (!connectionSuccess) {
        setConnectionError('Failed to connect to MongoDB');
      }
      
      return connectionSuccess;
    } catch (err) {
      console.error('Error connecting to database:', err);
      setConnectionError('Error connecting to database');
      return false;
    } finally {
      setConnecting(false);
    }
  };

  // Manual reconnection function
  const reconnect = async (): Promise<boolean> => {
    try {
      const result = await connectToDatabase();
      setIsConnected(result);
      
      if (!result && Platform.OS !== 'web') {
        Alert.alert(
          'Connection Failed',
          'Could not connect to MongoDB. Please check your network and server settings.',
          [{ text: 'OK' }]
        );
      }
      return result;
    } catch (error) {
      console.error('Reconnection error:', error);
      return false;
    }
  };

  // Disconnect from database
  const disconnect = async (): Promise<boolean> => {
    try {
      const disconnectionSuccess = await disconnectFromDatabase();
      setIsConnected(false);
      return disconnectionSuccess;
    } catch (err) {
      console.error('Error disconnecting from database:', err);
      setConnectionError('Error disconnecting from database');
      return false;
    }
  };

  // Set custom MongoDB URI
  const setCustomURI = async (uri: string): Promise<boolean> => {
    setConnecting(true);
    setConnectionError(null);
    
    try {
      const success = await setMongoDBURI(uri);
      setIsConnected(success);
      
      if (!success) {
        setConnectionError('Failed to connect with the provided URI');
      }
      
      return success;
    } catch (err) {
      console.error('Error setting custom URI:', err);
      setConnectionError('Error setting custom URI');
      return false;
    } finally {
      setConnecting(false);
    }
  };

  // Create playbook wrapper function
  const createPlaybook = async (name: string, description?: string): Promise<IPlaybook | null> => {
    return await createPlaybookBase({ name, description });
  };

  // Update playbook wrapper function
  const updatePlaybook = async (id: string, name?: string, description?: string): Promise<IPlaybook | null> => {
    const updateData: Partial<IPlaybook> = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    return await updatePlaybookBase(id, updateData);
  };

  // Add song to playbook wrapper function
  const addSongToPlaybook = async (playbookId: string, song: Partial<ISong>): Promise<IPlaybook | null> => {
    return await addSong(playbookId, song);
  };

  // Update song in playbook wrapper function
  const updateSongInPlaybook = async (playbookId: string, songId: string, song: Partial<ISong>): Promise<IPlaybook | null> => {
    return await updateSong(playbookId, songId, song);
  };

  // Delete song from playbook wrapper function
  const deleteSongFromPlaybook = async (playbookId: string, songId: string): Promise<IPlaybook | null> => {
    const success = await deleteSong(playbookId, songId);
    if (success) {
      // Need to reload the playbook to get updated data
      const updatedPlaybook = await loadPlaybook(playbookId);
      return updatedPlaybook || null;
    }
    return null;
  };

  // Sync with database (reload data)
  const syncWithDatabase = async (): Promise<boolean> => {
    try {
      await loadPlaybooks();
      return true;
    } catch (error) {
      console.error('Error syncing with database:', error);
      return false;
    }
  };

  // Refresh playbooks
  const refreshPlaybooks = async (): Promise<void> => {
    await loadPlaybooks();
  };

  // Get sections from the current song or empty array
  const sections = React.useMemo<Section[]>(() => {
    if (!selectedPlaybook || !selectedPlaybook.songs || selectedPlaybook.songs.length === 0) {
      return [];
    }
    
    // Just use the first song for now
    const currentSong = selectedPlaybook.songs[0] as ISong;
    return currentSong?.sections as unknown as Section[] || [];
  }, [selectedPlaybook]);

  // Section management functions
  const addSection = async (section: Section) => {
    if (!selectedPlaybook || !selectedPlaybook.songs || selectedPlaybook.songs.length === 0) {
      return;
    }
    
    // Get first song (could be updated to use a currentSongId)
    const currentSong = selectedPlaybook.songs[0] as ISong;
    
    // Add section to sections
    const updatedSections = [...(currentSong.sections as unknown as Section[]), section];
    
    // Update the song
    await updateSongInPlaybook(
      getIdString(selectedPlaybook),
      getIdString(currentSong),
      { sections: updatedSections as any }
    );
  };

  const updateSection = async (section: Section) => {
    if (!selectedPlaybook || !selectedPlaybook.songs || selectedPlaybook.songs.length === 0) {
      return;
    }
    
    const currentSong = selectedPlaybook.songs[0] as ISong;
    const currentSections = currentSong.sections as unknown as Section[];
    
    // Update the section
    const updatedSections = currentSections.map(s => 
      s.id === section.id ? section : s
    );
    
    // Update the song
    await updateSongInPlaybook(
      getIdString(selectedPlaybook),
      getIdString(currentSong),
      { sections: updatedSections as any }
    );
  };

  const deleteSection = async (sectionId: string) => {
    if (!selectedPlaybook || !selectedPlaybook.songs || selectedPlaybook.songs.length === 0) {
      return;
    }
    
    const currentSong = selectedPlaybook.songs[0] as ISong;
    const currentSections = currentSong.sections as unknown as Section[];
    
    // Filter out the section
    const updatedSections = currentSections.filter(s => s.id !== sectionId);
    
    // Update the song
    await updateSongInPlaybook(
      getIdString(selectedPlaybook),
      getIdString(currentSong),
      { sections: updatedSections as any }
    );
  };

  const clearSections = async () => {
    if (!selectedPlaybook || !selectedPlaybook.songs || selectedPlaybook.songs.length === 0) {
      return;
    }
    
    const currentSong = selectedPlaybook.songs[0] as ISong;
    
    // Update the song with empty sections
    await updateSongInPlaybook(
      getIdString(selectedPlaybook),
      getIdString(currentSong),
      { sections: [] }
    );
  };

  const value: MongoDBContextType = {
    // Connection status
    isConnected,
    connecting,
    connectionError,
    connect,
    disconnect,
    setCustomURI,
    reconnect,
    isOnline: isConnected, // For compatibility with old provider

    // Playbook operations
    playbooks,
    currentPlaybook,
    isLoading,
    error,
    setCurrentPlaybook,
    createPlaybook,
    updatePlaybook,
    deletePlaybook: deletePlaybookBase,
    
    // Songs
    addSongToPlaybook,
    updateSongInPlaybook,
    deleteSongFromPlaybook,
    
    // Current Song operations
    sections,
    addSection,
    updateSection,
    deleteSection,
    clearSections,
    
    // Sync
    syncWithDatabase,
    refreshPlaybooks
  };

  return (
    <MongoDBContext.Provider value={value}>
      {children}
    </MongoDBContext.Provider>
  );
};

// Custom hook to use the MongoDB context
export const useMongoDB = (): MongoDBContextType => {
  const context = useContext(MongoDBContext);
  
  if (context === undefined) {
    throw new Error('useMongoDB must be used within a MongoDBProvider');
  }
  
  return context;
};

// Shortcut hooks for convenience
export const useSong = () => {
  const { sections, addSection, updateSection, deleteSection, clearSections } = useMongoDB();
  return { sections, addSection, updateSection, deleteSection, clearSections };
};

export const usePlaybookContext = () => {
  const { 
    playbooks, 
    currentPlaybook, 
    setCurrentPlaybook,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
    addSongToPlaybook,
    updateSongInPlaybook,
    deleteSongFromPlaybook
  } = useMongoDB();
  
  return {
    playbooks,
    currentPlaybook,
    setCurrentPlaybook,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
    addSongToPlaybook,
    updateSongInPlaybook,
    deleteSongFromPlaybook
  };
}; 