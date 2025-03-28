import { Section } from './chord'

export interface Song {
  id: string
  title: string
  key: string
  sections: Section[]
}

export interface Playbook {
  _id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  songs: string[]
}

export interface CreatePlaybookInput {
  name: string
  description?: string
  songs: string[]
}

export interface UpdatePlaybookInput {
  name?: string
  description?: string
  songs?: string[]
}