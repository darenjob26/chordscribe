import { observable, computed } from '@legendapp/state';
import { Song, Playbook, PlaybookOperation } from './types/playbook';
import { apiService } from './services/apiService';
import { syncedCrud } from '@legendapp/state/sync-plugins/crud';
import { configureSynced, synced, SyncedGetParams } from '@legendapp/state/sync';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { syncedFetch } from '@legendapp/state/sync-plugins/fetch';

// Define types
type OperationType = 'create' | 'update' | 'delete';
type SyncStatus = 'synced' | 'pending' | 'error';

interface SyncQueueItem {
  id: string;
  type: 'song' | 'playbook';
  operation: OperationType;
  data: Song | Playbook;
  timestamp: number;
}

const playbooks = synced({
    initial: [],
    get: () =>  apiService.listPlaybooks(),
    set: ({ value }) => apiService.setPlaybook(value),
    persist: {
        plugin: ObservablePersistLocalStorage,
        retrySync: true,
        name: 'playbooks',
    },
    retry: {
        infinite: true
    },
})

export const store$ = observable({
    playbooks,
    addPlaybook: (playbook: Playbook) => {
        const newPlaybook: PlaybookOperation = {
            ...playbook,
            operation: 'create',
        }
        store$.playbooks.set([...store$.playbooks.get(), newPlaybook]);
    }
})

// // Song management with better typing and error handling
// const songManager = {
//   createSong(title: string, key: string, sections: any[], userId: string): string {
//     const id = generateId();
//     const now = new Date().toISOString();
//     const newSong: Song = {
//       _id: id,
//       userId,
//       title,
//       key,
//       sections,
//       syncStatus: isOnline$.get() ? 'synced' as SyncStatus : 'pending' as SyncStatus,
//       createdAt: now,
//       updatedAt: now,
//     };
    
//     // Add to local store immediately (optimistic UI)
//     store.songs[id].set(newSong);
    
//     if (isOnline$.get()) {
//       // If online, sync immediately
//       apiService.createSong(newSong)
//         .then(() => {
//           store.songs[id].syncStatus.set('synced' as SyncStatus);
//         })
//         .catch((error) => {
//           console.error('Error creating song:', error);
//           store.songs[id].syncStatus.set('error' as SyncStatus);
//           // Add to sync queue for retry
//           addToSyncQueue('song', 'create', newSong);
//         });
//     } else {
//       // If offline, add to sync queue
//       addToSyncQueue('song', 'create', newSong);
//     }
    
//     return id;
//   },
  
//   updateSong(id: string, updates: Partial<Song>): void {
//     const currentSong = store.songs[id].get();
//     if (!currentSong) return;
    
//     // Update locally
//     const updatedSong = {
//       ...currentSong,
//       ...updates,
//       syncStatus: isOnline$.get() ? 'synced' as SyncStatus : 'pending' as SyncStatus,
//       updatedAt: new Date().toISOString(),
//     };
    
//     store.songs[id].set(updatedSong);
    
//     if (isOnline$.get()) {
//       // If online, sync immediately
//       apiService.updateSong(updatedSong)
//         .then(() => {
//           store.songs[id].syncStatus.set('synced' as SyncStatus);
//         })
//         .catch((error) => {
//           console.error('Error updating song:', error);
//           store.songs[id].syncStatus.set('error' as SyncStatus);
//           // Add to sync queue for retry
//           addToSyncQueue('song', 'update', updatedSong);
//         });
//     } else {
//       // If offline, add to sync queue
//       addToSyncQueue('song', 'update', updatedSong);
//     }
//   },
  
//   deleteSong(id: string): void {
//     const song = store.songs[id].get();
//     if (!song) return;
    
//     // Mark as pending deletion
//     store.songs[id].syncStatus.set('pending' as SyncStatus);
    
//     if (isOnline$.get()) {
//       // If online, delete immediately
//       apiService.deleteSong(id)
//         .then(() => {
//           store.songs[id].delete();
//         })
//         .catch((error) => {
//           console.error('Error deleting song:', error);
//           store.songs[id].syncStatus.set('error' as SyncStatus);
//           // Add to sync queue for retry
//           addToSyncQueue('song', 'delete', song);
//         });
//     } else {
//       // If offline, add to sync queue and mark locally
//       addToSyncQueue('song', 'delete', song);
//     }
//   },
  
//   getAllSongs(): Song[] {
//     return Object.values(store.songs.get());
//   },
  
//   getSong(id: string): Song | undefined {
//     return store.songs[id].get();
//   }
// };

// // Playbook management with better typing and error handling
// const playbookManager = {
//   createPlaybook(name: string, userId: string, description?: string): string {
//     const id = generateId();
//     const now = new Date().toISOString();
//     const newPlaybook: Playbook = {
//       _id: id,
//       userId,
//       name,
//       description,
//       songs: [],
//       syncStatus: isOnline$.get() ? 'synced' as SyncStatus : 'pending' as SyncStatus,
//       createdAt: now,
//       updatedAt: now,
//     };
    
//     // Add to local store immediately
//     store.playbooks[id].set(newPlaybook);
    
//     if (isOnline$.get()) {
//       // If online, sync immediately
//       apiService.createPlaybook(newPlaybook)
//         .then(() => {
//           store.playbooks[id].syncStatus.set('synced' as SyncStatus);
//         })
//         .catch((error) => {
//           console.error('Error creating playbook:', error);
//           store.playbooks[id].syncStatus.set('error' as SyncStatus);
//           // Add to sync queue for retry
//           addToSyncQueue('playbook', 'create', newPlaybook);
//         });
//     } else {
//       // If offline, add to sync queue
//       addToSyncQueue('playbook', 'create', newPlaybook);
//     }
    
//     return id;
//   },
  
//   updatePlaybook(id: string, updates: Partial<Playbook>): void {
//     const currentPlaybook = store.playbooks[id].get();
//     if (!currentPlaybook) return;
    
//     // Update locally
//     const updatedPlaybook = {
//       ...currentPlaybook,
//       ...updates,
//       syncStatus: isOnline$.get() ? 'synced' as SyncStatus : 'pending' as SyncStatus,
//       updatedAt: new Date().toISOString(),
//     };
    
//     store.playbooks[id].set(updatedPlaybook);
    
//     if (isOnline$.get()) {
//       // If online, sync immediately
//       apiService.updatePlaybook(updatedPlaybook)
//         .then(() => {
//           store.playbooks[id].syncStatus.set('synced' as SyncStatus);
//         })
//         .catch((error) => {
//           console.error('Error updating playbook:', error);
//           store.playbooks[id].syncStatus.set('error' as SyncStatus);
//           // Add to sync queue for retry
//           addToSyncQueue('playbook', 'update', updatedPlaybook);
//         });
//     } else {
//       // If offline, add to sync queue
//       addToSyncQueue('playbook', 'update', updatedPlaybook);
//     }
//   },
  
//   deletePlaybook(id: string): void {
//     const playbook = store.playbooks[id].get();
//     if (!playbook) return;
    
//     // Mark as pending deletion
//     store.playbooks[id].syncStatus.set('pending' as SyncStatus);
    
//     if (isOnline$.get()) {
//       // If online, delete immediately
//       apiService.deletePlaybook(id)
//         .then(() => {
//           store.playbooks[id].delete();
//         })
//         .catch((error) => {
//           console.error('Error deleting playbook:', error);
//           store.playbooks[id].syncStatus.set('error' as SyncStatus);
//           // Add to sync queue for retry
//           addToSyncQueue('playbook', 'delete', playbook);
//         });
//     } else {
//       // If offline, add to sync queue and keep locally until sync
//       addToSyncQueue('playbook', 'delete', playbook);
//     }
//   },
  
//   addSongToPlaybook(playbookId: string, songId: string): void {
//     const playbook = store.playbooks[playbookId].get();
//     if (!playbook || playbook.songs.includes(songId)) return;
    
//     // Add song to playbook's songs array
//     const updatedSongs = [...playbook.songs, songId];
//     this.updatePlaybook(playbookId, { songs: updatedSongs });
//   },
  
//   removeSongFromPlaybook(playbookId: string, songId: string): void {
//     const playbook = store.playbooks[playbookId].get();
//     if (!playbook) return;
    
//     // Remove song from playbook's songs array
//     const updatedSongs = playbook.songs.filter((id: string) => id !== songId);
//     this.updatePlaybook(playbookId, { songs: updatedSongs });
//   },
  
//   getAllPlaybooks(): Playbook[] {
//     return Object.values(store.playbooks.get());
//   },
  
//   getPlaybook(id: string): Playbook | undefined {
//     return store.playbooks[id].get();
//   },
  
//   getPlaybookSongs(id: string): Song[] {
//     const playbook = store.playbooks[id].get();
//     if (!playbook) return [];
    
//     return playbook.songs
//       .map((songId: string) => store.songs[songId].get())
//       .filter(Boolean) as Song[];
//   }
// };