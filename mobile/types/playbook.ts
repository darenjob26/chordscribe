import { Section } from './chord'

export interface Song {
  id: string
  title: string
  key: string
  sections: Section[]
}

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