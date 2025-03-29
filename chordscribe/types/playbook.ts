import { Section } from './chord'

export interface Song {
  _id: string
  userId: string
  title: string
  key: string
  sections: Section[]
}

export interface Playbook {
  _id?: string
  userId: string | null
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  songs: string[]
}

export interface CreatePlaybookInput {
  userId: string | null
  name: string
  description?: string
  songs: string[]
}

export interface UpdatePlaybookInput {
  name?: string
  description?: string
  songs?: string[]
}