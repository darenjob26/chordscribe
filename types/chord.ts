export interface Chord {
  id: string
  root: string
  quality: string
  interval: string
  timing?: number
  bass?: string  // For slash chords
}

export interface Line {
  id: string
  chords: Chord[]
}

export interface Section {
  id: string
  name: string
  lines: Line[]
}

export interface Song {
  id: string
  title: string
  key: string
  sections: Section[]
} 