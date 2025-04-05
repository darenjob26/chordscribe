import { observable, computed, ObservablePrimitive } from '@legendapp/state';
import { Song, Playbook } from '../types/playbook';
import { apiService } from './apiService';
import { syncedCrud } from '@legendapp/state/sync-plugins/crud';
import { configureSynced, synced, SyncedGetParams } from '@legendapp/state/sync';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { syncedFetch } from '@legendapp/state/sync-plugins/fetch';


const playbooks = (userId: ObservablePrimitive<string>) => {
    return synced({
        initial: [],
        get: async (params) => {
            try {
                const userPlaybooks = await apiService.listPlaybooks(userId.get());
                // If no playbooks exist, create a default one
                if (userPlaybooks.length === 0) {
                    const defaultPlaybook: Playbook = {
                        _id: 'default-playbook',
                        userId: userId.get(),
                        name: 'My Songs',
                        description: 'Your default collection of songs',
                        songs: [],
                        syncStatus: 'pending',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    // First save locally
                    const localPlaybooks = [defaultPlaybook];
                    
                    // Then try to sync if online
                    try {
                        await apiService.upsertPlaybooks(userId.get(), localPlaybooks);
                        // Update sync status if successful
                        defaultPlaybook.syncStatus = 'synced';
                    } catch (error) {
                        console.log('Failed to sync default playbook, will retry when online');
                    }
                    return localPlaybooks;
                }
                return userPlaybooks;
            } catch (error) {
                console.log('Failed to fetch playbooks, using local storage');
                // Return empty array to trigger default playbook creation through transform
                return [];
            }
        },
        set: async ({ value }) => {
            try {
                await apiService.upsertPlaybooks(userId.get(), value);
            } catch (error) {
                console.log('Failed to sync playbooks, changes saved locally');
                // Still allow the set to complete locally even if API call fails
            }
        },
        transform: {
            save: (value: Playbook[]) => {
                // If no playbooks exist, create default one
                if (value.length === 0) {
                    const defaultPlaybook: Playbook = {
                        _id: 'default-playbook',
                        userId: userId.get(),
                        name: 'My Songs',
                        description: 'Your default collection of songs',
                        songs: [],
                        syncStatus: 'pending',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    return [defaultPlaybook];
                }
                // Mark all items as pending when saving locally
                return value.map(playbook => ({
                    ...playbook,
                    syncStatus: 'pending' as const
                }));
            },
            load: (value: Playbook[]) => {
                // If no playbooks exist, create default one
                if (value.length === 0) {
                    const defaultPlaybook: Playbook = {
                        _id: 'default-playbook',
                        userId: userId.get(),
                        name: 'My Songs',
                        description: 'Your default collection of songs',
                        songs: [],
                        syncStatus: 'pending',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    return [defaultPlaybook];
                }
                return value;
            }
        },
        persist: {
            plugin: ObservablePersistLocalStorage,
            retrySync: true,
            name: 'playbooks',
        },
        retry: {
            infinite: true,
            backoff: 'exponential'
        },
    })
}

export const userIdStore$ = observable({
    userId: '',
})

export const playBookStore$ = observable({
    playbooks: playbooks(userIdStore$.userId),
    addPlaybook: (playbook: Playbook) => {
        playBookStore$.playbooks.set([...playBookStore$.playbooks.get(), playbook]);
    },
    removePlaybook: (playbook: Playbook) => {
        playBookStore$.playbooks.set(playBookStore$.playbooks.get().filter((p) => p._id !== playbook._id));
    },
    updatePlaybook: (playbook: Playbook, changes: Partial<Playbook>) => {
        playBookStore$.playbooks.set(playBookStore$.playbooks.get().map((p) => p._id === playbook._id ? { ...p, ...changes } : p));
    },
    getPlaybookById: (id: string) => {
        return playBookStore$.playbooks.get().find((p) => p._id === id);
    },
    selectedPlaybook: '',
})

const songs = (playbookId: ObservablePrimitive<string>) => {
    return synced({
        initial: [],
        get: async () => {
            try {
                return await apiService.listPlaybookSongs(userIdStore$.userId.get(), playbookId.get());
            } catch (error) {
                console.log('Failed to fetch songs, using local storage');
                return [];
            }
        },
        set: async ({ value }) => {
            try {
                console.log('upserting songs', userIdStore$.userId.get(), playbookId.get(), value)
                await apiService.upsertSongs(userIdStore$.userId.get(), playbookId.get(), value);
            } catch (error) {
                console.log('Failed to sync songs, changes saved locally');
            }
        },
        transform: {
            save: (value: Song[]) => {
                return value.map(song => ({
                    ...song,
                    syncStatus: 'pending' as const
                }));
            },
            load: (value: Song[]) => {
                return value;
            }
        },
        persist: {
            plugin: ObservablePersistLocalStorage,
            retrySync: true,
            name: `songs-${playbookId.get()}`,
        },
        retry: {
            infinite: true,
            backoff: 'exponential'
        },
    })
}

export const songStore$ = observable({
    songs: songs(playBookStore$.selectedPlaybook),
    addSong: (song: Song) => {
        songStore$.songs.set([...songStore$.songs.get(), song]);
    },
    removeSong: (song: Song) => {
        songStore$.songs.set(songStore$.songs.get().filter((s) => s._id !== song._id));
    },
    updateSong: (song: Song) => {
        songStore$.songs.set(songStore$.songs.get().map((s) => s._id === song._id ? song : s));
    },
    getSongById: (id: string) => {
        return songStore$.songs.get().find((s) => s._id === id);
    },
    selectedSong: '',
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