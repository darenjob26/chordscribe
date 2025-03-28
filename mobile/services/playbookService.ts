import AsyncStorage from '@react-native-async-storage/async-storage';
import { isNetworkAvailable } from '../lib/network';
import { Playbook } from '../types/playbook';

const API_URL = 'http://localhost:3000/api/playbooks';
const STORAGE_KEY_PREFIX = 'playbook:';

export const createPlaybook = async (playbook: Omit<Playbook, 'id'>): Promise<Playbook> => {
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
        body: JSON.stringify(playbook)
      });
      
      const serverPlaybook = await response.json();
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}${localId}`,
        JSON.stringify({ ...serverPlaybook, synced: true })
      );
      
      return serverPlaybook;
    } else {
      // Offline: Store locally
      const localPlaybook = { ...playbook, id: localId, synced: false };
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

export const getPlaybooks = async (): Promise<Playbook[]> => {
  try {
    const isOnline = await isNetworkAvailable();
    
    if (isOnline) {
      // Online: Fetch from server
      const response = await fetch(API_URL);
      const serverPlaybooks = await response.json();
      
      // Update local storage with server data
      for (const playbook of serverPlaybooks) {
        await AsyncStorage.setItem(
          `${STORAGE_KEY_PREFIX}${playbook.id}`,
          JSON.stringify({ ...playbook, synced: true })
        );
      }
      
      return serverPlaybooks;
    } else {
      // Offline: Get from local storage
      const keys = await AsyncStorage.getAllKeys();
      const playbookKeys = keys.filter(k => k.startsWith(STORAGE_KEY_PREFIX));
      const playbooks = await Promise.all(
        playbookKeys.map(async (key) => {
          const playbookStr = await AsyncStorage.getItem(key);
          return playbookStr ? JSON.parse(playbookStr) : null;
        })
      );
      return playbooks.filter((playbook): playbook is Playbook => playbook !== null);
    }
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

  const keys = await AsyncStorage.getAllKeys();
  const unsyncedPlaybookKeys = keys.filter(k => 
    k.startsWith(STORAGE_KEY_PREFIX) && !k.includes('synced:true')
  );

  for (const key of unsyncedPlaybookKeys) {
    const playbookStr = await AsyncStorage.getItem(key);
    if (playbookStr) {
      const playbook = JSON.parse(playbookStr);
      try {
        if (!playbook.id) {
          // New playbook that needs to be created
          const { id, synced, ...playbookData } = playbook;
          const syncedPlaybook = await createPlaybook(playbookData);
          await AsyncStorage.setItem(key, JSON.stringify({
            ...syncedPlaybook,
            synced: true
          }));
        } else {
          // Existing playbook that needs to be updated
          const { synced, ...playbookData } = playbook;
          const syncedPlaybook = await updatePlaybook(playbook.id, playbookData);
          await AsyncStorage.setItem(key, JSON.stringify({
            ...syncedPlaybook,
            synced: true
          }));
        }
      } catch (error) {
        console.error('Sync failed for playbook:', playbook);
      }
    }
  }
}; 