export interface Chord {
  _id: string
  root: string
  quality: string
  interval: string
  timing?: number
  bass?: string  // For slash chords
}

export interface Line {
  _id: string
  chords: Chord[]
}

export interface Section {
  _id: string
  name: string
  lines: Line[]
}

export interface Song {
  _id: string
  title: string
  key: string
  sections: Section[]
} 