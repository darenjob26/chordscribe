import { subscribeToNetworkChanges } from '../lib/network';
import { syncOfflinePlaybooks } from './playbookService';

type SyncCallback = () => void;

let syncCallback: SyncCallback | null = null;
let syncLock = false;
let lastSyncTime = 0;
const SYNC_COOLDOWN = 5000; // 5 seconds cooldown between syncs

export const setSyncCallback = (callback: SyncCallback) => {
  syncCallback = callback;
};

const performSync = async () => {
  if (syncLock) {
    console.log('Sync is locked, skipping');
    return;
  }

  const now = Date.now();
  if (now - lastSyncTime < SYNC_COOLDOWN) {
    console.log('Skipping sync due to cooldown');
    return;
  }

  try {
    syncLock = true;
    console.log('Starting sync operation...');
    
    await syncOfflinePlaybooks();
    
    console.log('Sync completed successfully');
    lastSyncTime = Date.now();
    
    if (syncCallback) {
      syncCallback();
    }
  } catch (error) {
    console.error('Error during sync:', error);
  } finally {
    syncLock = false;
  }
};

export const startSyncService = () => {
  let lastNetworkStatus = false;

  const unsubscribe = subscribeToNetworkChanges(async (isConnected: boolean) => {
    if (isConnected !== lastNetworkStatus) {
      lastNetworkStatus = isConnected;
      
      if (isConnected) {
        console.log('Network connected, starting sync...');
        await performSync();
      } else {
        console.log('Network disconnected');
      }
    }
  });

  return unsubscribe;
}; 