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
                const songs = await apiService.listPlaybookSongs(userIdStore$.userId.get(), playbookId.get());
                return songs;
            } catch (error) {
                console.log('Failed to fetch songs, using local storage');
                return [];
            }
        },
        set: async ({ value }) => {
            try {
                await apiService.upsertSongs(userIdStore$.userId.get(), playbookId.get(), value);
            } catch (error) {
                console.log('Failed to sync songs, changes saved locally');
            }
        },
        transform: {
            save: (value: Song[]) => {
                const songs = value.map(song => ({
                    ...song,
                    syncStatus: 'pending' as const
                }));
                return songs;
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
