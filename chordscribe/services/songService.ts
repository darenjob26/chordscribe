import AsyncStorage from '@react-native-async-storage/async-storage';
import { isNetworkAvailable } from '../lib/network';
import { Song } from '../types/playbook';

const API_URL = 'http://localhost:3000/api/songs';
const STORAGE_KEY_PREFIX = 'song:';

export const createSong = async (song: Omit<Song, 'id'>): Promise<Song> => {
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
        `${STORAGE_KEY_PREFIX}${localId}`,
        JSON.stringify({ ...serverSong, synced: true })
      );
      
      return serverSong;
    } else {
      // Offline: Store locally
      const localSong = { ...song, id: localId, synced: false };
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}${localId}`,
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
          `${STORAGE_KEY_PREFIX}${song.id}`,
          JSON.stringify({ ...song, synced: true })
        );
      }
      
      return serverSongs;
    } else {
      // Offline: Get from local storage
      const keys = await AsyncStorage.getAllKeys();
      const songKeys = keys.filter(k => k.startsWith(STORAGE_KEY_PREFIX));
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
    const localKey = `${STORAGE_KEY_PREFIX}${songId}`;
    
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
    const localKey = `${STORAGE_KEY_PREFIX}${songId}`;
    
    if (isOnline) {
      // Online: Delete from server
      await fetch(`${API_URL}/${songId}`, {
        method: 'DELETE'
      });
    }
    
    // Always delete from local storage
    await AsyncStorage.removeItem(localKey);
  } catch (error) {
    console.error('Error deleting song:', error);
    throw error;
  }
};

export const syncOfflineSongs = async (): Promise<void> => {
  const isOnline = await isNetworkAvailable();
  if (!isOnline) return;

  const keys = await AsyncStorage.getAllKeys();
  const unsyncedSongKeys = keys.filter(k => 
    k.startsWith(STORAGE_KEY_PREFIX) && !k.includes('synced:true')
  );

  for (const key of unsyncedSongKeys) {
    const songStr = await AsyncStorage.getItem(key);
    if (songStr) {
      const song = JSON.parse(songStr);
      try {
        if (!song.id) {
          // New song that needs to be created
          const { id, synced, ...songData } = song;
          const syncedSong = await createSong(songData);
          await AsyncStorage.setItem(key, JSON.stringify({
            ...syncedSong,
            synced: true
          }));
        } else {
          // Existing song that needs to be updated
          const { synced, ...songData } = song;
          const syncedSong = await updateSong(song.id, songData);
          await AsyncStorage.setItem(key, JSON.stringify({
            ...syncedSong,
            synced: true
          }));
        }
      } catch (error) {
        console.error('Sync failed for song:', song);
      }
    }
  }
}; 