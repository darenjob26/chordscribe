import { subscribeToNetworkChanges } from '../lib/network';
import { syncOfflineSongs } from './songService';
import { syncOfflinePlaybooks } from './playbookService';

export const startSyncService = () => {
  // Subscribe to network changes
  const unsubscribe = subscribeToNetworkChanges(async (isConnected) => {
    if (isConnected) {
      console.log('Network connected, starting sync...');
      try {
        // Sync both entities
        await Promise.all([
          syncOfflineSongs(),
          syncOfflinePlaybooks()
        ]);
        console.log('Sync completed successfully');
      } catch (error) {
        console.error('Error during sync:', error);
      }
    } else {
      console.log('Network disconnected');
    }
  });

  // Return unsubscribe function
  return unsubscribe;
}; 