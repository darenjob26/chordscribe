import AsyncStorage from '@react-native-async-storage/async-storage';
import { isNetworkAvailable } from '../lib/network';
import { Playbook, CreatePlaybookInput, Song } from '@/types/playbook';
import { useAuth } from '@/providers/auth-provider';
import { usePlaybook } from '@/providers/PlaybookProvider';

const API_URL = 'http://localhost:3000/api/playbooks';
const PLAYBOOK_STORAGE_KEY_PREFIX = 'playbook:';
const SONG_STORAGE_KEY_PREFIX = 'song:';

export const deleteAllPlaybooks = async () => {
  console.log('deleting all playbook local')
  const keys = await AsyncStorage.getAllKeys();
  const playbookKeys = keys.filter(k => k.startsWith(PLAYBOOK_STORAGE_KEY_PREFIX));
  await AsyncStorage.multiRemove(playbookKeys);
}

export const createPlaybook = async (playbook: CreatePlaybookInput): Promise<Playbook> => {
  try {
    const isOnline = await isNetworkAvailable();

    if (isOnline) {
      // Online: Sync with server
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...playbook,
          synced: true
        })
      });

      const serverPlaybook = await response.json();
      // Use server's _id for storage
      await AsyncStorage.setItem(
        `${PLAYBOOK_STORAGE_KEY_PREFIX}${serverPlaybook._id}`,
        JSON.stringify({ ...serverPlaybook, synced: true })
      );

      return serverPlaybook;
    } else {
      // Offline: Store locally
      const localId = Date.now().toString();
      const localPlaybook = {
        ...playbook,
        _id: 'local_' + localId, // Add local _id for offline tracking
        synced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem(
        `${PLAYBOOK_STORAGE_KEY_PREFIX}${localId}`,
        JSON.stringify(localPlaybook)
      );
      return localPlaybook;
    }
  } catch (error) {
    console.error('Playbook creation error:', error);
    throw error;
  }
};

export const getPlaybooks = async (userId: string): Promise<Playbook[]> => {
  try {
    console.log('get playbooks')
    const isOnline = await isNetworkAvailable();

    let playbooksList: Playbook[] = [];

    if (isOnline) {
      // Online: Fetch from server
      const response = await fetch(`${API_URL}?userId=${userId}`);
      const serverPlaybooks = await response.json();

      // Clear existing playbooks from local storage
      const keys = await AsyncStorage.getAllKeys();
      const playbookKeys = keys.filter(k => k.startsWith(PLAYBOOK_STORAGE_KEY_PREFIX));
      await AsyncStorage.multiRemove(playbookKeys);

      // Update local storage with server data
      for (const playbook of serverPlaybooks) {
        await AsyncStorage.setItem(
          `${PLAYBOOK_STORAGE_KEY_PREFIX}${playbook._id}`,
          JSON.stringify({ ...playbook, synced: true })
        );
      }

      playbooksList = serverPlaybooks;
    } else {
      // Offline: Get from local storage
      console.log('get offline')
      const keys = await AsyncStorage.getAllKeys();
      const playbookKeys = keys.filter(k => k.startsWith(PLAYBOOK_STORAGE_KEY_PREFIX));
      const playbooks = await Promise.all(
        playbookKeys.map(async (key) => {
          const playbookStr = await AsyncStorage.getItem(key);
          return playbookStr ? JSON.parse(playbookStr) : null;
        })
      );
      const filteredPlaybooks = playbooks
        .filter((playbook): playbook is Playbook => playbook !== null)
        .filter(playbook => playbook.userId === userId)
        .filter(playbook => !playbook.markedForDeletion);

      // Only create default playbook if there are no playbooks at all
      if (filteredPlaybooks.length === 0) {
        const defaultPlaybook: Playbook = {
          name: 'My Songs',
          description: 'Your default song collection',
          songs: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: userId,
          synced: false
        };
        const localId = Date.now().toString();
        await AsyncStorage.setItem(
          `${PLAYBOOK_STORAGE_KEY_PREFIX}${localId}`,
          JSON.stringify(defaultPlaybook)
        );

        playbooksList = [defaultPlaybook];
      } else {
        // Fetch song details for each playbook's songs
        const songKeys = keys.filter(k => k.startsWith(SONG_STORAGE_KEY_PREFIX));
        const songs = await Promise.all(
          songKeys.map(async (key) => {
            const songStr = await AsyncStorage.getItem(key);
            return songStr ? JSON.parse(songStr) : null;
          })
        );

        // Create a map of song IDs to song objects for faster lookup
        const songMap = new Map(
          songs
            .filter((song): song is Song => song !== null)
            .map(song => [song._id, song])
        );

        playbooksList = filteredPlaybooks.map(playbook => {
          // Convert all songs to song objects
          const songObjects = playbook.songs.map(song => {
            // If it's already a song object, return it
            if (typeof song === 'object' && song !== null) {
              return song;
            }
            // If it's a string (ID), look up the song object
            return songMap.get(song as string) || song;
          });

          return {
            ...playbook,
            songs: songObjects
          };
        });
      }
    }

    return playbooksList.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch (error) {
    console.error('Error fetching playbooks:', error);
    throw error;
  }
};

export const getPlaybookById = async (playbookId: string): Promise<Playbook | null> => {
  try {
    const isOnline = await isNetworkAvailable();
    const localKey = `${PLAYBOOK_STORAGE_KEY_PREFIX}${playbookId}`;

    let playbook: Playbook | null = null;

    if (isOnline) {
      // Online: Fetch from server
      const response = await fetch(`${API_URL}/${playbookId}`);
      if (!response.ok) return null;

      playbook = await response.json();
      await AsyncStorage.setItem(
        localKey,
        JSON.stringify({ ...playbook, synced: true })
      );
    } else {
      // Offline: Get from local storage
      const playbookStr = await AsyncStorage.getItem(localKey);
      if (!playbookStr) return null;
      playbook = JSON.parse(playbookStr);
    }

    if (!playbook) return null;

    // Fetch all songs from storage
    const songKeys = await AsyncStorage.getAllKeys();
    const songKeysFiltered = songKeys.filter(k => k.startsWith(SONG_STORAGE_KEY_PREFIX));
    const songs = await Promise.all(
      songKeysFiltered.map(async (key) => {
        const songStr = await AsyncStorage.getItem(key);
        if (!songStr) return null;
        const song = JSON.parse(songStr);
        return song.markedForDeletion ? null : song;
      })
    );

    // Create a map of song IDs to song objects
    const songMap = new Map(
      songs
        .filter((song): song is Song => song !== null)
        .map(song => [song._id, song])
    );

    // Convert all songs to song objects
    playbook.songs = playbook.songs.map(song => {
      // If it's already a song object, return it
      if (typeof song === 'object' && song !== null) {
        return song;
      }
      // If it's a string (ID), look up the song object
      return songMap.get(song as string) || song;
    });

    return playbook;
  } catch (error) {
    console.error('Error fetching playbook:', error);
    throw error;
  }
};

export const updatePlaybook = async (playbookId: string, updates: Partial<Playbook>): Promise<Playbook> => {
  try {
    const isOnline = await isNetworkAvailable();
    const localKey = `${PLAYBOOK_STORAGE_KEY_PREFIX}${playbookId}`;

    if (isOnline) {
      // Online: Update on server
      const response = await fetch(`${API_URL}/${playbookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      const updatedPlaybook = await response.json();
      await AsyncStorage.setItem(
        localKey,
        JSON.stringify({ ...updatedPlaybook, synced: true })
      );

      return updatedPlaybook;
    } else {
      // Offline: Update local storage
      const playbookStr = await AsyncStorage.getItem(localKey);
      if (!playbookStr) throw new Error('Playbook not found');

      const existingPlaybook = JSON.parse(playbookStr);
      const updatedPlaybook = { ...existingPlaybook, ...updates, synced: false };

      // If songs array is being updated, ensure we're not including deleted songs
      if (updates.songs) {
        console.log('updating songs', updates.songs);
        
        // Fetch all songs from storage
        const songKeys = await AsyncStorage.getAllKeys();
        const songKeysFiltered = songKeys.filter(k => k.startsWith(SONG_STORAGE_KEY_PREFIX));
        const songs = await Promise.all(
          songKeysFiltered.map(async (key) => {
            const songStr = await AsyncStorage.getItem(key);
            if (!songStr) return null;
            const song = JSON.parse(songStr);
            return song.markedForDeletion ? null : song;
          })
        );

        // Create a map of song IDs to song objects
        const songMap = new Map(
          songs
            .filter((song): song is Song => song !== null)
            .map(song => [song._id, song])
        );

        // Convert all songs to song objects
        updatedPlaybook.songs = updates.songs.map(song => {
          // If it's already a song object, return it
          if (typeof song === 'object' && song !== null) {
            return song;
          }
          // If it's a string (ID), look up the song object
          return songMap.get(song as string) || song;
        });

        console.log('updatedPlaybook', updatedPlaybook);
      }

      await AsyncStorage.setItem(localKey, JSON.stringify(updatedPlaybook));

      return updatedPlaybook;
    }
  } catch (error) {
    console.error('Error updating playbook:', error);
    throw error;
  }
};

export const deletePlaybook = async (playbookId: string): Promise<void> => {
  try {
    const isOnline = await isNetworkAvailable();
    const localKey = `${PLAYBOOK_STORAGE_KEY_PREFIX}${playbookId}`;

    if (isOnline) {
      // Online: Delete from server
      await fetch(`${API_URL}/${playbookId}`, {
        method: 'DELETE'
      });
      // Delete from local storage after successful server deletion
      await AsyncStorage.removeItem(localKey);
    } else {
      // Offline: Mark for deletion in local storage
      const playbookStr = await AsyncStorage.getItem(localKey);
      if (playbookStr) {
        const playbook = JSON.parse(playbookStr);
        await AsyncStorage.setItem(
          localKey,
          JSON.stringify({ ...playbook, markedForDeletion: true })
        );
      }
    }
  } catch (error) {
    console.error('Error deleting playbook:', error);
    throw error;
  }
};

export const syncOfflinePlaybooks = async (): Promise<void> => {
  const isOnline = await isNetworkAvailable();
  if (!isOnline) return;

  console.log('Starting sync of offline playbooks...');
  const keys = await AsyncStorage.getAllKeys();
  const playbookKeys = keys.filter(k => k.startsWith(PLAYBOOK_STORAGE_KEY_PREFIX));

  for (const key of playbookKeys) {
    const playbookStr = await AsyncStorage.getItem(key);
    if (playbookStr) {
      const playbook = JSON.parse(playbookStr);
      try {
        // Handle playbooks marked for deletion
        if (playbook.markedForDeletion) {
          console.log('Deleting playbook marked for deletion:', playbook._id);
          if (playbook._id) {
            await fetch(`${API_URL}/${playbook._id}`, {
              method: 'DELETE'
            });
          }
          await AsyncStorage.removeItem(key);
          continue;
        }

        if (!playbook.synced) {
          console.log('Syncing offline playbook:', {
            id: playbook._id,
            name: playbook.name,
            isNew: !playbook._id || playbook._id.startsWith('local_')
          });

          if (!playbook._id || playbook._id.startsWith('local_')) {
            // New playbook that needs to be created
            const { synced, _id, markedForDeletion, ...playbookData } = playbook;
            const syncedPlaybook = await createPlaybook(playbookData);

            // Remove old version and store new one
            await AsyncStorage.removeItem(key);
            await AsyncStorage.setItem(
              `${PLAYBOOK_STORAGE_KEY_PREFIX}${syncedPlaybook._id}`,
              JSON.stringify({ ...syncedPlaybook, synced: true })
            );

            console.log('Successfully synced new playbook:', syncedPlaybook._id);
          } else {
            // Existing playbook that needs to be updated
            const { synced, _id, markedForDeletion, ...playbookData } = playbook;
            const syncedPlaybook = await updatePlaybook(_id, playbookData);

            // Update local storage with synced version
            await AsyncStorage.setItem(
              key,
              JSON.stringify({ ...syncedPlaybook, synced: true })
            );

            console.log('Successfully synced existing playbook:', _id);
          }
        }
      } catch (error) {
        console.error('Error syncing playbook:', error);
      }
    }
  }
  console.log('Finished syncing offline playbooks');
}; 