import { Song } from "./chord"

export interface Playbook {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  songs: Song[]
}

export interface CreatePlaybookInput {
  name: string
  description?: string
}

export interface UpdatePlaybookInput {
  name?: string
  description?: string
}

export interface PlaybookContextType {
  playbooks: Playbook[]
  currentPlaybook: Playbook | null
  isLoading: boolean
  error: string | null
  createPlaybook: (input: CreatePlaybookInput) => Promise<Playbook>
  updatePlaybook: (id: string, input: UpdatePlaybookInput) => Promise<Playbook>
  deletePlaybook: (id: string) => Promise<void>
  getPlaybook: (id: string) => Promise<Playbook | null>
  addSongToPlaybook: (playbookId: string, song: Song) => Promise<Playbook>
  updateSongInPlaybook: (playbookId: string, songId: string, song: Song) => Promise<Playbook>
  deleteSongFromPlaybook: (playbookId: string, songId: string) => Promise<Playbook>
  setCurrentPlaybook: (playbook: Playbook | null) => void
} 