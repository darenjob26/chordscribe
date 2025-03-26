import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Playbook, PlaybookContextType, CreatePlaybookInput, UpdatePlaybookInput } from "@/types/playbook"
import { Song } from "@/types/chord"

const STORAGE_KEY = "@playbooks"

// Mock data for initial state
const mockPlaybooks: Playbook[] = [
  {
    id: "default",
    name: "Your Songs",
    description: "Your personal collection of songs",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songs: [
      {
        id: "1",
        title: "What A Beautiful Name",
        key: "G",
        sections: [
          {
            id: "1",
            name: "Verse 1",
            lines: [
              {
                id: "1",
                chords: [
                  {
                    id: "1",
                    root: "G",
                    quality: "maj",
                    interval: "none",
                    timing: 2,
                  },
                  {
                    id: "2",
                    root: "D",
                    quality: "maj",
                    interval: "none",
                  },
                  {
                    id: "3",
                    root: "Em",
                    quality: "min",
                    interval: "none",
                  },
                  {
                    id: "4",
                    root: "C",
                    quality: "maj",
                    interval: "none",
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            name: "Chorus",
            lines: [
              {
                id: "1",
                chords: [
                  {
                    id: "5",
                    root: "G",
                    quality: "maj",
                    interval: "none",
                  },
                  {
                    id: "6",
                    root: "D",
                    quality: "maj",
                    interval: "none",
                  },
                  {
                    id: "7",
                    root: "E",
                    quality: "min",
                    interval: "none",
                    timing: 3,
                  },
                  {
                    id: "8",
                    root: "C",
                    quality: "maj",
                    interval: "none",
                  },
                ],
              },
              {
                id: "2",
                chords: [
                  {
                    id: "5",
                    root: "G",
                    quality: "maj",
                    interval: "none",
                    timing: 6,
                  },
                  {
                    id: "6",
                    root: "D",
                    quality: "maj",
                    interval: "none",
                    timing: 6,
                  },
                  {
                    id: "7",
                    root: "E",
                    quality: "min",
                    interval: "none",
                    timing: 3,
                  },
                  {
                    id: "8",
                    root: "C",
                    quality: "maj",
                    interval: "none",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "2",
        title: "Goodness of God",
        key: "C",
        sections: [
          {
            id: "1",
            name: "Verse 1",
            lines: [
              {
                id: "1",
                chords: [
                  {
                    id: "1",
                    root: "C",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "2",
                    root: "G",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "3",
                    root: "Am",
                    quality: "min",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "4",
                    root: "F",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            name: "Chorus",
            lines: [
              {
                id: "1",
                chords: [
                  {
                    id: "5",
                    root: "C",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "6",
                    root: "G",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "7",
                    root: "Am",
                    quality: "min",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "8",
                    root: "F",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "worship",
    name: "Worship Songs",
    description: "Collection of worship songs",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songs: [
      {
        id: "1",
        title: "What A Beautiful Name",
        key: "G",
        sections: [
          {
            id: "1",
            name: "Verse 1",
            lines: [
              {
                id: "1",
                chords: [
                  {
                    id: "1",
                    root: "G",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "2",
                    root: "D",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "3",
                    root: "Em",
                    quality: "min",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "4",
                    root: "C",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            name: "Chorus",
            lines: [
              {
                id: "1",
                chords: [
                  {
                    id: "5",
                    root: "G",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "6",
                    root: "D",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "7",
                    root: "Em",
                    quality: "min",
                    interval: "none",
                    timing: 4,
                  },
                  {
                    id: "8",
                    root: "C",
                    quality: "maj",
                    interval: "none",
                    timing: 4,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "christmas",
    name: "Christmas Songs",
    description: "Collection of Christmas songs",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    songs: [
      {
        id: "1",
        title: "Silent Night",
        key: "C",
        sections: [
          {
            id: "1",
            name: "Verse 1",
            lines: [
              {
                id: "1",
                chords: [
                  {
                    id: "1",
                    root: "C",
                    quality: "maj",
                    interval: "none",
                    timing: 3,
                  },
                  {
                    id: "2",
                    root: "G",
                    quality: "maj",
                    interval: "none",
                    timing: 3,
                  },
                  {
                    id: "3",
                    root: "C",
                    quality: "maj",
                    interval: "none",
                    timing: 3,
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            name: "Chorus",
            lines: [
              {
                id: "1",
                chords: [
                  {
                    id: "4",
                    root: "C",
                    quality: "maj",
                    interval: "none",
                    timing: 3,
                  },
                  {
                    id: "5",
                    root: "G",
                    quality: "maj",
                    interval: "none",
                    timing: 3,
                  },
                  {
                    id: "6",
                    root: "C",
                    quality: "maj",
                    interval: "none",
                    timing: 3,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

const PlaybookContext = createContext<PlaybookContextType | undefined>(undefined)

export function PlaybookProvider({ children }: { children: React.ReactNode }) {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [currentPlaybook, setCurrentPlaybook] = useState<Playbook | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load playbooks from storage on mount
  useEffect(() => {
    loadPlaybooks()
  }, [])

  const loadPlaybooks = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "")
      const stored = await AsyncStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPlaybooks(JSON.parse(stored))
      } else {
        // Initialize with mock data if no stored data
        setPlaybooks(mockPlaybooks)
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockPlaybooks))
      }
    } catch (err) {
      setError("Failed to load playbooks")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const savePlaybooks = async (newPlaybooks: Playbook[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaybooks))
      setPlaybooks(newPlaybooks)
    } catch (err) {
      setError("Failed to save playbooks")
      console.error(err)
    }
  }

  const createPlaybook = async (input: CreatePlaybookInput): Promise<Playbook> => {
    const newPlaybook: Playbook = {
      id: `playbook-${Date.now()}`,
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      songs: []
    }
    const newPlaybooks = [...playbooks, newPlaybook]
    await savePlaybooks(newPlaybooks)
    return newPlaybook
  }

  const updatePlaybook = async (id: string, input: UpdatePlaybookInput): Promise<Playbook> => {
    const newPlaybooks = playbooks.map(playbook => 
      playbook.id === id
        ? {
            ...playbook,
            ...input,
            updatedAt: new Date().toISOString()
          }
        : playbook
    )
    await savePlaybooks(newPlaybooks)
    return newPlaybooks.find(p => p.id === id)!
  }

  const deletePlaybook = async (id: string): Promise<void> => {
    const newPlaybooks = playbooks.filter(playbook => playbook.id !== id)
    await savePlaybooks(newPlaybooks)
  }

  const getPlaybook = async (id: string): Promise<Playbook | null> => {
    return playbooks.find(playbook => playbook.id === id) || null
  }

  const addSongToPlaybook = async (playbookId: string, song: Song): Promise<Playbook> => {
    const newPlaybooks = playbooks.map(playbook => 
      playbook.id === playbookId
        ? {
            ...playbook,
            songs: [...playbook.songs, song],
            updatedAt: new Date().toISOString()
          }
        : playbook
    )
    await savePlaybooks(newPlaybooks)
    return newPlaybooks.find(p => p.id === playbookId)!
  }

  const updateSongInPlaybook = async (playbookId: string, songId: string, song: Song): Promise<Playbook> => {
    const newPlaybooks = playbooks.map(playbook => 
      playbook.id === playbookId
        ? {
            ...playbook,
            songs: playbook.songs.map(s => s.id === songId ? song : s),
            updatedAt: new Date().toISOString()
          }
        : playbook
    )
    await savePlaybooks(newPlaybooks)
    return newPlaybooks.find(p => p.id === playbookId)!
  }

  const deleteSongFromPlaybook = async (playbookId: string, songId: string): Promise<Playbook> => {
    const newPlaybooks = playbooks.map(playbook => 
      playbook.id === playbookId
        ? {
            ...playbook,
            songs: playbook.songs.filter(s => s.id !== songId),
            updatedAt: new Date().toISOString()
          }
        : playbook
    )
    await savePlaybooks(newPlaybooks)
    return newPlaybooks.find(p => p.id === playbookId)!
  }

  return (
    <PlaybookContext.Provider
      value={{
        playbooks,
        currentPlaybook,
        isLoading,
        error,
        createPlaybook,
        updatePlaybook,
        deletePlaybook,
        getPlaybook,
        addSongToPlaybook,
        updateSongInPlaybook,
        deleteSongFromPlaybook,
        setCurrentPlaybook,
      }}
    >
      {children}
    </PlaybookContext.Provider>
  )
}

export function usePlaybook() {
  const context = useContext(PlaybookContext)
  if (context === undefined) {
    throw new Error("usePlaybook must be used within a PlaybookProvider")
  }
  return context
} 