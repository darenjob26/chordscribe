import { Song, Playbook } from '../types/playbook';

export const apiService = {

    async getSong(id: any): Promise<Song> {
        // const response = await fetch(`/api/songs/${id}`);
        // return response.json();

        return {
            _id: '1',
            userId: '1',
            title: 'Song 1',
            key: 'C',
            sections: [],
            syncStatus: 'synced',
            createdAt: '2021-01-01',
            updatedAt: '2021-01-01',
        };
    },

    // Create a song in the server database
    async createSong(song: Song): Promise<Song> {
        const response = await fetch('/api/songs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(song),
        });
        return response.json();
    },

    // Update a song in the server database
    async updateSong(song: Song): Promise<Song> {
        const response = await fetch(`/api/songs/${song._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(song),
        });
        return response.json();
    },

    // Delete a song from the server database
    async deleteSong(id: string): Promise<void> {
        await fetch(`/api/songs/${id}`, {
            method: 'DELETE',
        });
    },

    async listPlaybooks(userId: string): Promise<Playbook[]> {
        const response = await fetch(`http://localhost:3000/api/playbooks/${userId}`);
        return response.json();
    },

    async upsertPlaybooks(userId: string, playbooks: Playbook[]): Promise<void> {
        const response = await fetch(`http://localhost:3000/api/playbooks/${userId}/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playbooks),
        });

        return response.json();
    },

    async listPlaybookSongs(userId: string, id: string): Promise<Song[]> {
        const response = await fetch(`http://localhost:3000/api/playbooks/${userId}/${id}/songs`);
        return response.json();
    },
}; 