import { Section } from './chord'

type SyncStatus = 'synced' | 'pending' | 'error';

export interface Song {
  _id: string
  userId: string
  title: string
  key: string
  sections: Section[]
  syncStatus: SyncStatus
  createdAt: string
  updatedAt: string
}

export interface Playbook {
  _id: string
  userId: string
  name: string
  description?: string
  songs: string[]
  syncStatus: SyncStatus
  createdAt: string
  updatedAt: string
}

type OperationType = 'create' | 'update' | 'delete';

export type PlaybookOperation = Playbook & {
  operation: OperationType
}