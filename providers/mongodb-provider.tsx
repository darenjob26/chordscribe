import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { usePlaybookDB } from '@/lib/hooks/usePlaybookDB';
import { IPlaybook, ISong } from '@/lib/models';
import { connectToDatabase, isConnectedToDatabase } from '@/lib/database';
import { Section } from '@/types/chord';
import mongooseConfig from '@/lib/mongodb-config';
import { Alert, Platform } from 'react-native';
import { Types } from 'mongoose';

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

// Define the MongoDB context type
export interface MongoDBContextType {
  // Playbooks
  playbooks: IPlaybook[];
  currentPlaybook: IPlaybook | null;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  setCurrentPlaybook: (playbook: IPlaybook | null) => void;
  createPlaybook: (name: string, description?: string) => Promise<IPlaybook | null>;
  updatePlaybook: (id: string, name?: string, description?: string) => Promise<IPlaybook | null>;
  deletePlaybook: (id: string) => Promise<boolean>;
  
  // Songs
  addSongToPlaybook: (playbookId: string, song: Partial<ISong>) => Promise<IPlaybook | null>;
  updateSongInPlaybook: (playbookId: string, songId: string, song: Partial<ISong>) => Promise<IPlaybook | null>;
  deleteSongFromPlaybook: (playbookId: string, songId: string) => Promise<IPlaybook | null>;
  
  // Current Song (equivalent to SongProvider functionality)
  sections: Section[];
  addSection: (section: Section) => void;
  updateSection: (section: Section) => void;
  deleteSection: (sectionId: string) => void;
  clearSections: () => void;
  
  // Sync
  syncWithDatabase: () => Promise<boolean>;
  refreshPlaybooks: () => Promise<void>;
  
  // Connection state
  reconnect: () => Promise<boolean>;
}

// Create the context
const MongoDBContext = createContext<MongoDBContextType | undefined>(undefined);

// Provider component
export function MongoDBProvider({ children }: { children: ReactNode }) {
  const {
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
    refreshPlaybooks
  } = usePlaybookDB();

  // Attempt reconnection if mongoose connection is closed
  useEffect(() => {
    const checkConnection = () => {
      if (mongooseConfig.connection && mongooseConfig.connection.readyState === 0) {
        console.log('MongoDB disconnected, attempting reconnect...');
        connectToDatabase().catch(err => {
          console.warn('Reconnection attempt failed:', err);
        });
      }
    };
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Manual reconnection function
  const reconnect = async (): Promise<boolean> => {
    try {
      const result = await connectToDatabase();
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

  // Get sections from the current song or empty array
  const sections = React.useMemo<Section[]>(() => {
    if (!currentPlaybook || !currentPlaybook.songs || currentPlaybook.songs.length === 0) {
      return [];
    }
    
    // Just use the first song for now (could be updated to track currentSongId)
    const currentSong = currentPlaybook.songs[0] as ISong;
    return currentSong?.sections as unknown as Section[] || [];
  }, [currentPlaybook]);

  // Section management functions (compatible with the existing SongProvider)
  const addSection = async (section: Section) => {
    if (!currentPlaybook || !currentPlaybook.songs || currentPlaybook.songs.length === 0) {
      return;
    }
    
    // Get first song (could be updated to use a currentSongId)
    const currentSong = currentPlaybook.songs[0] as ISong;
    
    // Add section to sections
    const updatedSections = [...(currentSong.sections as unknown as Section[]), section];
    
    // Update the song
    await updateSongInPlaybook(
      (currentPlaybook._id as Types.ObjectId).toString(),
      (currentSong._id as Types.ObjectId).toString(),
      { sections: updatedSections as any }
    );
  };

  const updateSection = async (section: Section) => {
    if (!currentPlaybook || !currentPlaybook.songs || currentPlaybook.songs.length === 0) {
      return;
    }
    
    const currentSong = currentPlaybook.songs[0] as ISong;
    const currentSections = currentSong.sections as unknown as Section[];
    
    // Update the section
    const updatedSections = currentSections.map(s => 
      s.id === section.id ? section : s
    );
    
    // Update the song
    await updateSongInPlaybook(
      (currentPlaybook._id as Types.ObjectId).toString(),
      (currentSong._id as Types.ObjectId).toString(),
      { sections: updatedSections as any }
    );
  };

  const deleteSection = async (sectionId: string) => {
    if (!currentPlaybook || !currentPlaybook.songs || currentPlaybook.songs.length === 0) {
      return;
    }
    
    const currentSong = currentPlaybook.songs[0] as ISong;
    const currentSections = currentSong.sections as unknown as Section[];
    
    // Filter out the section
    const updatedSections = currentSections.filter(s => s.id !== sectionId);
    
    // Update the song
    await updateSongInPlaybook(
      (currentPlaybook._id as Types.ObjectId).toString(),
      (currentSong._id as Types.ObjectId).toString(),
      { sections: updatedSections as any }
    );
  };

  const clearSections = async () => {
    if (!currentPlaybook || !currentPlaybook.songs || currentPlaybook.songs.length === 0) {
      return;
    }
    
    const currentSong = currentPlaybook.songs[0] as ISong;
    
    // Update the song with empty sections
    await updateSongInPlaybook(
      (currentPlaybook._id as Types.ObjectId).toString(),
      (currentSong._id as Types.ObjectId).toString(),
      { sections: [] }
    );
  };

  // Provide the context value
  const contextValue: MongoDBContextType = {
    // Playbooks
    playbooks,
    currentPlaybook,
    isLoading,
    error,
    isOnline,
    setCurrentPlaybook,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
    
    // Songs
    addSongToPlaybook,
    updateSongInPlaybook,
    deleteSongFromPlaybook,
    
    // Current Song (equivalent to SongProvider)
    sections,
    addSection,
    updateSection,
    deleteSection,
    clearSections,
    
    // Sync
    syncWithDatabase,
    refreshPlaybooks,
    
    // Connection state
    reconnect
  };

  return (
    <MongoDBContext.Provider value={contextValue}>
      {children}
    </MongoDBContext.Provider>
  );
}

// Hook to use the MongoDB context
export function useMongoDB() {
  const context = useContext(MongoDBContext);
  if (context === undefined) {
    throw new Error('useMongoDB must be used within a MongoDBProvider');
  }
  return context;
}

// Specific hooks to maintain compatibility with existing code
export function useSong() {
  const { sections, addSection, updateSection, deleteSection, clearSections } = useMongoDB();
  return { sections, addSection, updateSection, deleteSection, clearSections };
}

export function usePlaybook() {
  const {
    playbooks,
    currentPlaybook,
    isLoading,
    error,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
    addSongToPlaybook,
    updateSongInPlaybook,
    deleteSongFromPlaybook,
    setCurrentPlaybook
  } = useMongoDB();
  
  return {
    playbooks,
    currentPlaybook,
    isLoading,
    error,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
    addSongToPlaybook,
    updateSongInPlaybook, 
    deleteSongFromPlaybook,
    setCurrentPlaybook
  };
} 