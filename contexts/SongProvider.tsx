import { createContext, useContext, useState, ReactNode } from 'react'
import { Section } from '@/types/chord'

interface SongContextType {
  sections: Section[]
  addSection: (section: Section) => void
  updateSection: (section: Section) => void
  deleteSection: (sectionId: string) => void
  clearSections: () => void
}

const SongContext = createContext<SongContextType | undefined>(undefined)

export function SongProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<Section[]>([])

  const addSection = (section: Section) => {
    setSections(prev => [...prev, section])
  }

  const updateSection = (section: Section) => {
    setSections(prev => prev.map(s => 
      s.id === section.id ? section : s
    ))
  }

  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId))
  }

  const clearSections = () => {
    setSections([])
  }

  return (
    <SongContext.Provider value={{
      sections,
      addSection,
      updateSection,
      deleteSection,
      clearSections
    }}>
      {children}
    </SongContext.Provider>
  )
}

export function useSong() {
  const context = useContext(SongContext)
  if (context === undefined) {
    throw new Error('useSong must be used within a SongProvider')
  }
  return context
} 