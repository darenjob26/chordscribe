import AsyncStorage from '@react-native-async-storage/async-storage';
import { isNetworkAvailable } from '../lib/network';
import { Playbook, CreatePlaybookInput } from '@/types/playbook';
import { useAuth } from '@/providers/auth-provider';
import { usePlaybook } from '@/providers/PlaybookProvider';

const API_URL = 'http://localhost:3000/api/playbooks';
const STORAGE_KEY_PREFIX = 'playbook:';

export const deleteAllPlaybooks = async () => {
  console.log('deleting all playbook local')
  const keys = await AsyncStorage.getAllKeys();
  const playbookKeys = keys.filter(k => k.startsWith(STORAGE_KEY_PREFIX));
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
        `${STORAGE_KEY_PREFIX}${serverPlaybook._id}`,
        JSON.stringify({ ...serverPlaybook, synced: true })
      );
      
      return serverPlaybook;
    } else {
      // Offline: Store locally
      const localId = Date.now().toString();
      const localPlaybook = { 
        ...playbook, 
        _id: 'local_'+localId, // Add local _id for offline tracking
        synced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}${localId}`,
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
      const playbookKeys = keys.filter(k => k.startsWith(STORAGE_KEY_PREFIX));
      await AsyncStorage.multiRemove(playbookKeys);
      
      // Update local storage with server data
      for (const playbook of serverPlaybooks) {
        await AsyncStorage.setItem(
          `${STORAGE_KEY_PREFIX}${playbook._id}`,
          JSON.stringify({ ...playbook, synced: true })
        );
      }
      
      playbooksList = serverPlaybooks;
    } else {
      // Offline: Get from local storage
      console.log('get offline')
      const keys = await AsyncStorage.getAllKeys();
      const playbookKeys = keys.filter(k => k.startsWith(STORAGE_KEY_PREFIX));
      const playbooks = await Promise.all(
        playbookKeys.map(async (key) => {
          const playbookStr = await AsyncStorage.getItem(key);
          return playbookStr ? JSON.parse(playbookStr) : null;
        })
      );
      const filteredPlaybooks = playbooks
        .filter((playbook): playbook is Playbook => playbook !== null)
        .filter(playbook => playbook.userId === userId);

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
          `${STORAGE_KEY_PREFIX}${localId}`,
          JSON.stringify(defaultPlaybook)
        );

        playbooksList = [defaultPlaybook];
      }

      playbooksList = filteredPlaybooks;
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
    const localKey = `${STORAGE_KEY_PREFIX}${playbookId}`;
    
    if (isOnline) {
      // Online: Fetch from server
      const response = await fetch(`${API_URL}/${playbookId}`);
      if (!response.ok) return null;
      
      const serverPlaybook = await response.json();
      await AsyncStorage.setItem(
        localKey,
        JSON.stringify({ ...serverPlaybook, synced: true })
      );
      
      return serverPlaybook;
    } else {
      // Offline: Get from local storage
      const playbookStr = await AsyncStorage.getItem(localKey);
      return playbookStr ? JSON.parse(playbookStr) : null;
    }
  } catch (error) {
    console.error('Error fetching playbook:', error);
    throw error;
  }
};

export const updatePlaybook = async (playbookId: string, updates: Partial<Playbook>): Promise<Playbook> => {
  try {
    const isOnline = await isNetworkAvailable();
    const localKey = `${STORAGE_KEY_PREFIX}${playbookId}`;
    
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
    const localKey = `${STORAGE_KEY_PREFIX}${playbookId}`;
    
    if (isOnline) {
      // Online: Delete from server
      await fetch(`${API_URL}/${playbookId}`, {
        method: 'DELETE'
      });
    }
    
    // Always delete from local storage
    await AsyncStorage.removeItem(localKey);
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
  const playbookKeys = keys.filter(k => k.startsWith(STORAGE_KEY_PREFIX));


  for (const key of playbookKeys) {
    const playbookStr = await AsyncStorage.getItem(key);
    if (playbookStr) {
      const playbook = JSON.parse(playbookStr);
      try {
        if (!playbook.synced) {
          console.log('Syncing offline playbook:', { 
            id: playbook._id, 
            name: playbook.name,
            isNew: !playbook._id || playbook._id.startsWith('local_')
          });
          
          if (!playbook._id || playbook._id.startsWith('local_')) {
            // New playbook that needs to be created
            const { synced, _id, ...playbookData } = playbook;
            const syncedPlaybook = await createPlaybook(playbookData);
            
            // Remove old version and store new one
            await AsyncStorage.removeItem(key);
            await AsyncStorage.setItem(
              `${STORAGE_KEY_PREFIX}${syncedPlaybook._id}`,
              JSON.stringify({ ...syncedPlaybook, synced: true })
            );
            
            console.log('Successfully synced new playbook:', syncedPlaybook._id);
          } else {
            // Existing playbook that needs to be updated
            const { synced, _id, ...playbookData } = playbook;
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