import AsyncStorage from '@react-native-async-storage/async-storage';
import { isNetworkAvailable } from '../lib/network';
import { Song } from '../types/playbook';

const API_URL = 'http://localhost:3000/api/songs';
const SONG_STORAGE_KEY_PREFIX = 'song:';

export const createSong = async (song: Omit<Song, '_id'>): Promise<Song> => {
  try {
    const localId = Date.now().toString();
    const isOnline = await isNetworkAvailable();
    
    if (isOnline) {
      // Online: Sync with server
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(song)
      });
      
      const serverSong = await response.json();
      await AsyncStorage.setItem(
        `${SONG_STORAGE_KEY_PREFIX}${serverSong._id}`,
        JSON.stringify({ ...serverSong, synced: true })
      );
      
      return serverSong;
    } else {
      // Offline: Store locally
      const localSong = { 
        ...song, 
        _id: `${SONG_STORAGE_KEY_PREFIX}${localId}`, // Change to match the format used in playbooks
        synced: false 
      };
      await AsyncStorage.setItem(
        `${SONG_STORAGE_KEY_PREFIX}${localId}`,
        JSON.stringify(localSong)
      );
      return localSong;
    }
  } catch (error) {
    console.error('Song creation error:', error);
    throw error;
  }
};

export const getSongs = async (): Promise<Song[]> => {
  try {
    const isOnline = await isNetworkAvailable();
    
    if (isOnline) {
      // Online: Fetch from server
      const response = await fetch(API_URL);
      const serverSongs = await response.json();
      
      // Update local storage with server data
      for (const song of serverSongs) {
        await AsyncStorage.setItem(
          `${SONG_STORAGE_KEY_PREFIX}${song._id}`,
          JSON.stringify({ ...song, synced: true })
        );
      }
      
      return serverSongs;
    } else {
      // Offline: Get from local storage
      const keys = await AsyncStorage.getAllKeys();
      const songKeys = keys.filter(k => k.startsWith(SONG_STORAGE_KEY_PREFIX));
      const songs = await Promise.all(
        songKeys.map(async (key) => {
          const songStr = await AsyncStorage.getItem(key);
          return songStr ? JSON.parse(songStr) : null;
        })
      );
      return songs.filter((song): song is Song => song !== null);
    }
  } catch (error) {
    console.error('Error fetching songs:', error);
    throw error;
  }
};

export const updateSong = async (songId: string, updates: Partial<Song>): Promise<Song> => {
  try {
    const isOnline = await isNetworkAvailable();
    const localKey = `${SONG_STORAGE_KEY_PREFIX}${songId}`;
    
    if (isOnline) {
      // Online: Update on server
      const response = await fetch(`${API_URL}/${songId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      const updatedSong = await response.json();
      await AsyncStorage.setItem(
        localKey,
        JSON.stringify({ ...updatedSong, synced: true })
      );
      
      return updatedSong;
    } else {
      // Offline: Update local storage
      const songStr = await AsyncStorage.getItem(localKey);
      if (!songStr) throw new Error('Song not found');
      
      const existingSong = JSON.parse(songStr);
      const updatedSong = { ...existingSong, ...updates, synced: false };
      await AsyncStorage.setItem(localKey, JSON.stringify(updatedSong));
      
      return updatedSong;
    }
  } catch (error) {
    console.error('Error updating song:', error);
    throw error;
  }
};

export const deleteSong = async (songId: string): Promise<void> => {
  try {
    const isOnline = await isNetworkAvailable();
    const localKey = `${SONG_STORAGE_KEY_PREFIX}${songId}`;
    
    if (isOnline) {
      // Online: Delete from server
      await fetch(`${API_URL}/${songId}`, {
        method: 'DELETE'
      });
      // Delete from local storage after successful server deletion
      await AsyncStorage.removeItem(localKey);
    } else {
      // Offline: Mark for deletion in local storage
      const songStr = await AsyncStorage.getItem(localKey);
      if (songStr) {
        const song = JSON.parse(songStr);
        await AsyncStorage.setItem(
          localKey,
          JSON.stringify({ ...song, markedForDeletion: true })
        );
      }
    }
  } catch (error) {
    console.error('Error deleting song:', error);
    throw error;
  }
};

export const syncOfflineSongs = async (): Promise<void> => {
  const isOnline = await isNetworkAvailable();
  if (!isOnline) return;

  const keys = await AsyncStorage.getAllKeys();
  const songKeys = keys.filter(k => k.startsWith(SONG_STORAGE_KEY_PREFIX));

  for (const key of songKeys) {
    const songStr = await AsyncStorage.getItem(key);
    if (songStr) {
      const song = JSON.parse(songStr);
      try {
        // Handle songs marked for deletion
        if (song.markedForDeletion) {
          console.log('Deleting song marked for deletion:', song._id);
          if (song._id && !song._id.startsWith('local_')) {
            await fetch(`${API_URL}/${song._id}`, {
              method: 'DELETE'
            });
          }
          await AsyncStorage.removeItem(key);
          continue;
        }

        if (!song.synced) {
          console.log('Syncing offline song:', { 
            id: song._id, 
            title: song.title,
            isNew: !song._id || song._id.startsWith('local_')
          });
          
          if (!song._id || song._id.startsWith('local_')) {
            // New song that needs to be created
            const { _id, synced, markedForDeletion, ...songData } = song;
            const syncedSong = await createSong(songData);
            
            // Remove old version and store new one
            await AsyncStorage.removeItem(key);
            await AsyncStorage.setItem(
              `${SONG_STORAGE_KEY_PREFIX}${syncedSong._id}`,
              JSON.stringify({ ...syncedSong, synced: true })
            );
            
            console.log('Successfully synced new song:', syncedSong._id);
          } else {
            // Existing song that needs to be updated
            const { synced, _id, markedForDeletion, ...songData } = song;
            const syncedSong = await updateSong(_id, songData);
            
            // Update local storage with synced version
            await AsyncStorage.setItem(
              key,
              JSON.stringify({ ...syncedSong, synced: true })
            );
            
            console.log('Successfully synced existing song:', _id);
          }
        }
      } catch (error) {
        console.error('Error syncing song:', error);
      }
    }
  }
}; 