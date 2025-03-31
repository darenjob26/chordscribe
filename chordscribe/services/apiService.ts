import { Song, Playbook, PlaybookOperation } from '../types/playbook';

export const apiService = {
    async listSongs(): Promise<Song[]> {
        // const response = await fetch('/api/songs');
        // return response.json();

        return [
            {
                _id: '1',
                userId: '1',
                title: 'Song 1',
                key: 'C',
                sections: [],
                syncStatus: 'synced',
                createdAt: '2021-01-01',
                updatedAt: '2021-01-01',
            }
        ]
    },

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

    async listPlaybooks(): Promise<Playbook[] | PlaybookOperation[]> {
        const response = await fetch('http://localhost:3000/api/playbooks/test');
        return response.json();
    },

    async setPlaybook(playbooks: PlaybookOperation[] | Playbook[]): Promise<void> {
        try {
            for(const playbook of playbooks) {
                if(playbook.hasOwnProperty('operation')) {
                    if(playbook.operation === 'create') {
                        await this.createPlaybook(playbook);
                    } else if(playbook.operation === 'update') {
                        await this.updatePlaybook(playbook);
                    } else if(playbook.operation === 'delete') {
                        await this.deletePlaybook(playbook._id);
                    }
                }
            }
        } catch(error) {
            console.error(error);
        }
    },

    // Create a playbook in the server database
    async createPlaybook(playbook: Playbook):  Promise<void | Playbook | null | undefined> {
        const response = await fetch('/api/playbooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playbook),
        });
        return response.json();
    },

    // Update a playbook in the server database
    async updatePlaybook(playbook: Playbook): Promise<Playbook> {
        const response = await fetch(`/api/playbooks/${playbook._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playbook),
        });
        return response.json();
    },

    // Delete a playbook from the server database
    async deletePlaybook(id: string): Promise<void> {
        await fetch(`/api/playbooks/${id}`, {
            method: 'DELETE',
        });
    },
}; 