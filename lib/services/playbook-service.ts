import { 
  PlaybookModel, 
  IPlaybook, 
  SongModel, 
  ISong, 
  SectionModel,
  ISection,
  LineModel,
  ILine,
  ChordModel,
  IChord
} from '../models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectToDatabase, isConnectedToDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { 
  Collections,
  findAll,
  findById,
  insertOne,
  updateOne,
  deleteOne,
  isLocalStorageDBActive 
} from '../local-storage-db';

// Storage key for local data
const STORAGE_KEY = '@playbooks';

// Local storage compatible types
interface LocalPlaybook extends Omit<IPlaybook, '_id'> {
  _id: string;
  songs: LocalSong[];
}

interface LocalSong extends Omit<ISong, '_id' | 'sections'> {
  _id: string;
  sections: LocalSection[];
}

interface LocalSection extends Omit<ISection, '_id' | 'lines'> {
  _id: string;
  name: string;
  lines: LocalLine[];
}

interface LocalLine extends Omit<ILine, '_id' | 'chords'> {
  _id: string;
  chords: LocalChord[];
}

interface LocalChord extends Omit<IChord, '_id'> {
  _id: string;
  root: string;
  quality: string;
  interval?: string;
  timing?: number;
  bass?: string;
}

// Service for Playbook operations
export class PlaybookService {
  // Get all playbooks
  static async getAllPlaybooks(): Promise<IPlaybook[]> {
    try {
      // First check if local storage DB is active
      if (await isLocalStorageDBActive()) {
        // Use our local storage database
        const localPlaybooks = await findAll<LocalPlaybook>(Collections.PLAYBOOKS);
        return localPlaybooks as unknown as IPlaybook[];
      }
      
      // Try to get data from MongoDB if connected
      if (isConnectedToDatabase()) {
        const playbooks = await PlaybookModel.find().populate({
          path: 'songs',
          populate: {
            path: 'sections',
            populate: {
              path: 'lines',
              populate: 'chords'
            }
          }
        });
        
        // Store in local storage as backup
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playbooks));
        
        return playbooks;
      } 
      
      // Fall back to local storage if not connected
      const storageData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storageData) {
        return JSON.parse(storageData);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting playbooks:', error);
      
      // Final fallback: return empty array
      return [];
    }
  }

  // Get playbook by ID
  static async getPlaybookById(id: string): Promise<IPlaybook | null> {
    try {
      // First check if local storage DB is active
      if (await isLocalStorageDBActive()) {
        // Use our local storage database
        const localPlaybook = await findById<LocalPlaybook>(Collections.PLAYBOOKS, id);
        return localPlaybook as unknown as IPlaybook;
      }
      
      // Try MongoDB if connected
      if (isConnectedToDatabase()) {
        return await PlaybookModel.findById(id).populate({
          path: 'songs',
          populate: {
            path: 'sections',
            populate: {
              path: 'lines',
              populate: 'chords'
            }
          }
        });
      }
      
      // Fall back to local storage
      const storageData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storageData) {
        const playbooks = JSON.parse(storageData);
        return playbooks.find((p: any) => p._id === id || p.id === id) || null;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting playbook with ID ${id}:`, error);
      return null;
    }
  }

  // Create a new playbook
  static async createPlaybook(data: Partial<IPlaybook>): Promise<IPlaybook> {
    try {
      // Check if using local storage DB
      if (await isLocalStorageDBActive()) {
        const newPlaybook = await insertOne<LocalPlaybook>(Collections.PLAYBOOKS, {
          name: data.name || 'New Playbook',
          description: data.description || '',
          songs: [] as LocalSong[],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        return newPlaybook as unknown as IPlaybook;
      }
      
      await connectToDatabase();
      
      if (isConnectedToDatabase()) {
        // Create in MongoDB
        const playbook = new PlaybookModel({
          name: data.name,
          description: data.description || '',
          songs: []
        });
        
        await playbook.save();
        
        // Update local storage
        const playbooks = await this.getAllPlaybooks();
        playbooks.push(playbook);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playbooks));
        
        return playbook;
      } 
      
      // Create locally if not connected
      const newPlaybook = {
        _id: uuidv4(),
        name: data.name || 'New Playbook',
        description: data.description || '',
        songs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const storageData = await AsyncStorage.getItem(STORAGE_KEY);
      const playbooks = storageData ? JSON.parse(storageData) : [];
      playbooks.push(newPlaybook);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playbooks));
      
      return newPlaybook as unknown as IPlaybook;
    } catch (error) {
      console.error('Error creating playbook:', error);
      throw error;
    }
  }

  // Update a playbook
  static async updatePlaybook(id: string, data: Partial<IPlaybook>): Promise<IPlaybook | null> {
    try {
      // Check if using local storage DB
      if (await isLocalStorageDBActive()) {
        const updatedPlaybook = await updateOne<LocalPlaybook>(Collections.PLAYBOOKS, id, {
          ...data,
          updatedAt: new Date()
        });
        
        return updatedPlaybook as unknown as IPlaybook;
      }
      
      if (isConnectedToDatabase()) {
        // Update in MongoDB
        const playbook = await PlaybookModel.findByIdAndUpdate(
          id,
          { $set: data },
          { new: true }
        ).populate({
          path: 'songs',
          populate: {
            path: 'sections',
            populate: {
              path: 'lines',
              populate: 'chords'
            }
          }
        });
        
        if (!playbook) return null;
        
        // Update local storage
        const playbooks = await this.getAllPlaybooks();
        const updatedPlaybooks = playbooks.map((p: any) => 
          p._id === id || p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
        );
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlaybooks));
        
        return playbook;
      }
      
      // Update locally if not connected
      const storageData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storageData) {
        const playbooks = JSON.parse(storageData);
        const updatedPlaybooks = playbooks.map((p: any) => 
          p._id === id || p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
        );
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlaybooks));
        
        return updatedPlaybooks.find((p: any) => p._id === id || p.id === id) || null;
      }
      
      return null;
    } catch (error) {
      console.error(`Error updating playbook with ID ${id}:`, error);
      return null;
    }
  }

  // Delete a playbook
  static async deletePlaybook(id: string): Promise<boolean> {
    try {
      // Check if using local storage DB
      if (await isLocalStorageDBActive()) {
        return await deleteOne(Collections.PLAYBOOKS, id);
      }
      
      if (isConnectedToDatabase()) {
        // Delete from MongoDB
        await PlaybookModel.findByIdAndDelete(id);
      }
      
      // Delete from local storage
      const storageData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storageData) {
        const playbooks = JSON.parse(storageData);
        const filteredPlaybooks = playbooks.filter((p: any) => p._id !== id && p.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPlaybooks));
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting playbook with ID ${id}:`, error);
      return false;
    }
  }

  // Add song to playbook
  static async addSongToPlaybook(playbookId: string, songData: Partial<ISong>): Promise<IPlaybook | null> {
    try {
      // Check if using local storage DB
      if (await isLocalStorageDBActive()) {
        // Get the playbook
        const playbook = await findById<LocalPlaybook>(Collections.PLAYBOOKS, playbookId);
        if (!playbook) return null;
        
        // Create a new song
        const newSong = await insertOne<LocalSong>(Collections.SONGS, {
          title: songData.title || 'New Song',
          key: songData.key || 'C',
          sections: songData.sections as unknown as LocalSection[] || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        if (!newSong) return null;
        
        // Add song to playbook
        const songs = playbook.songs || [];
        const updatedPlaybook = await updateOne<LocalPlaybook>(Collections.PLAYBOOKS, playbookId, {
          songs: [...songs, newSong],
          updatedAt: new Date()
        });
        
        return updatedPlaybook as unknown as IPlaybook;
      }
      
      await connectToDatabase();
      
      if (isConnectedToDatabase()) {
        // Create song and related documents in MongoDB
        const song = await this.createSongWithRelations(songData);
        
        // Add to playbook
        const playbook = await PlaybookModel.findByIdAndUpdate(
          playbookId,
          { $push: { songs: song._id } },
          { new: true }
        ).populate({
          path: 'songs',
          populate: {
            path: 'sections',
            populate: {
              path: 'lines',
              populate: 'chords'
            }
          }
        });
        
        if (!playbook) return null;
        
        // Update local storage
        await this.getAllPlaybooks(); // This will update the local storage
        
        return playbook;
      }
      
      // Add locally if not connected
      const storageData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storageData) {
        const playbooks = JSON.parse(storageData);
        const playbookIndex = playbooks.findIndex((p: any) => p._id === playbookId || p.id === playbookId);
        
        if (playbookIndex === -1) return null;
        
        const newSong = {
          _id: uuidv4(),
          title: songData.title || 'New Song',
          key: songData.key || 'C',
          sections: songData.sections || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        playbooks[playbookIndex].songs = playbooks[playbookIndex].songs || [];
        playbooks[playbookIndex].songs.push(newSong);
        playbooks[playbookIndex].updatedAt = new Date().toISOString();
        
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playbooks));
        
        return playbooks[playbookIndex] as unknown as IPlaybook;
      }
      
      return null;
    } catch (error) {
      console.error(`Error adding song to playbook with ID ${playbookId}:`, error);
      return null;
    }
  }

  // Helper method to create song with all relations
  private static async createSongWithRelations(songData: Partial<ISong>): Promise<ISong> {
    // Create the song first
    const song = new SongModel({
      title: songData.title,
      key: songData.key,
      sections: [],
    });
    
    // Create sections if provided
    if (songData.sections && Array.isArray(songData.sections)) {
      for (const sectionData of songData.sections as (ISection & { name: string, lines: any[] })[]) {
        const section = new SectionModel({
          name: sectionData.name,
          lines: [],
        });
        
        // Create lines if provided
        if (sectionData.lines && Array.isArray(sectionData.lines)) {
          for (const lineData of sectionData.lines as (ILine & { chords: any[] })[]) {
            const line = new LineModel({
              chords: [],
            });
            
            // Create chords if provided
            if (lineData.chords && Array.isArray(lineData.chords)) {
              for (const chordData of lineData.chords as IChord[]) {
                const chord = new ChordModel({
                  root: chordData.root,
                  quality: chordData.quality,
                  interval: chordData.interval,
                  timing: chordData.timing,
                  bass: chordData.bass,
                });
                
                await chord.save();
                line.chords.push(chord._id);
              }
            }
            
            await line.save();
            section.lines.push(line._id);
          }
        }
        
        await section.save();
        song.sections.push(section._id);
      }
    }
    
    await song.save();
    return song;
  }

  // Update song in playbook
  static async updateSongInPlaybook(playbookId: string, songId: string, data: Partial<ISong>): Promise<IPlaybook | null> {
    try {
      // Check if using local storage DB
      if (await isLocalStorageDBActive()) {
        // Get the playbook
        const playbook = await findById<LocalPlaybook>(Collections.PLAYBOOKS, playbookId);
        if (!playbook || !playbook.songs) return null;
        
        // Find the song in the playbook
        const songIndex = playbook.songs.findIndex((s: any) => s._id === songId);
        if (songIndex === -1) return null;
        
        // Update the song
        const updatedSong = {
          ...playbook.songs[songIndex],
          ...data,
          _id: songId, // Ensure ID doesn't change
          updatedAt: new Date()
        } as LocalSong;
        
        // Update the songs array
        const updatedSongs = [...playbook.songs];
        updatedSongs[songIndex] = updatedSong;
        
        // Update the playbook
        const updatedPlaybook = await updateOne<LocalPlaybook>(Collections.PLAYBOOKS, playbookId, {
          songs: updatedSongs,
          updatedAt: new Date()
        });
        
        return updatedPlaybook as unknown as IPlaybook;
      }
      
      if (isConnectedToDatabase()) {
        // Update song in MongoDB
        await SongModel.findByIdAndUpdate(songId, { $set: data });
        
        // Get updated playbook
        const playbook = await PlaybookModel.findById(playbookId).populate({
          path: 'songs',
          populate: {
            path: 'sections',
            populate: {
              path: 'lines',
              populate: 'chords'
            }
          }
        });
        
        // Update local storage
        await this.getAllPlaybooks(); // This will update the local storage
        
        return playbook;
      }
      
      // Update locally if not connected
      const storageData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storageData) {
        const playbooks = JSON.parse(storageData);
        const playbookIndex = playbooks.findIndex((p: any) => p._id === playbookId || p.id === playbookId);
        
        if (playbookIndex === -1) return null;
        
        const songIndex = playbooks[playbookIndex].songs.findIndex((s: any) => s._id === songId || s.id === songId);
        
        if (songIndex === -1) return null;
        
        playbooks[playbookIndex].songs[songIndex] = {
          ...playbooks[playbookIndex].songs[songIndex],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        
        playbooks[playbookIndex].updatedAt = new Date().toISOString();
        
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playbooks));
        
        return playbooks[playbookIndex] as unknown as IPlaybook;
      }
      
      return null;
    } catch (error) {
      console.error(`Error updating song ${songId} in playbook ${playbookId}:`, error);
      return null;
    }
  }

  // Delete song from playbook
  static async deleteSongFromPlaybook(playbookId: string, songId: string): Promise<IPlaybook | null> {
    try {
      // Check if using local storage DB
      if (await isLocalStorageDBActive()) {
        // Get the playbook
        const playbook = await findById<LocalPlaybook>(Collections.PLAYBOOKS, playbookId);
        if (!playbook || !playbook.songs) return null;
        
        // Filter out the song
        const updatedSongs = playbook.songs.filter((s: any) => s._id !== songId);
        
        // Update the playbook
        const updatedPlaybook = await updateOne<LocalPlaybook>(Collections.PLAYBOOKS, playbookId, {
          songs: updatedSongs,
          updatedAt: new Date()
        });
        
        return updatedPlaybook as unknown as IPlaybook;
      }
      
      if (isConnectedToDatabase()) {
        // Remove from playbook in MongoDB
        const playbook = await PlaybookModel.findByIdAndUpdate(
          playbookId,
          { $pull: { songs: songId } },
          { new: true }
        ).populate({
          path: 'songs',
          populate: {
            path: 'sections',
            populate: {
              path: 'lines',
              populate: 'chords'
            }
          }
        });
        
        // Delete the song and related documents
        await SongModel.findByIdAndDelete(songId);
        
        // Update local storage
        await this.getAllPlaybooks(); // This will update the local storage
        
        return playbook;
      }
      
      // Update locally if not connected
      const storageData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storageData) {
        const playbooks = JSON.parse(storageData);
        const playbookIndex = playbooks.findIndex((p: any) => p._id === playbookId || p.id === playbookId);
        
        if (playbookIndex === -1) return null;
        
        playbooks[playbookIndex].songs = playbooks[playbookIndex].songs.filter(
          (s: any) => s._id !== songId && s.id !== songId
        );
        
        playbooks[playbookIndex].updatedAt = new Date().toISOString();
        
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playbooks));
        
        return playbooks[playbookIndex] as unknown as IPlaybook;
      }
      
      return null;
    } catch (error) {
      console.error(`Error deleting song ${songId} from playbook ${playbookId}:`, error);
      return null;
    }
  }

  // Sync local data with MongoDB
  static async syncWithDatabase(): Promise<boolean> {
    try {
      // Only attempt sync if connected
      if (!isConnectedToDatabase()) {
        await connectToDatabase();
        if (!isConnectedToDatabase()) return false;
      }
      
      // If using local storage DB, sync that data to MongoDB
      if (await isLocalStorageDBActive()) {
        const localPlaybooks = await findAll<LocalPlaybook>(Collections.PLAYBOOKS);
        
        // For each local playbook, create or update in MongoDB
        for (const localPlaybook of localPlaybooks) {
          let dbPlaybook = await PlaybookModel.findOne({ 
            $or: [
              { _id: localPlaybook._id },
              { name: localPlaybook.name }
            ]
          });
          
          // Create if doesn't exist
          if (!dbPlaybook) {
            dbPlaybook = new PlaybookModel({
              name: localPlaybook.name,
              description: localPlaybook.description,
              songs: [],
            });
          } else {
            // Update existing
            dbPlaybook.name = localPlaybook.name;
            dbPlaybook.description = localPlaybook.description;
          }
          
          // Sync songs
          if (localPlaybook.songs && Array.isArray(localPlaybook.songs)) {
            for (const localSong of localPlaybook.songs) {
              await this.syncSong(dbPlaybook._id, localSong);
            }
          }
          
          await dbPlaybook.save();
        }
        
        return true;
      }
      
      // Get local data from AsyncStorage
      const storageData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!storageData) return true; // Nothing to sync
      
      const localPlaybooks = JSON.parse(storageData);
      
      // For each local playbook, create or update in MongoDB
      for (const localPlaybook of localPlaybooks) {
        let dbPlaybook = await PlaybookModel.findOne({ 
          $or: [
            { _id: localPlaybook._id },
            { name: localPlaybook.name }
          ]
        });
        
        // Create if doesn't exist
        if (!dbPlaybook) {
          dbPlaybook = new PlaybookModel({
            name: localPlaybook.name,
            description: localPlaybook.description,
            songs: [],
          });
        } else {
          // Update existing
          dbPlaybook.name = localPlaybook.name;
          dbPlaybook.description = localPlaybook.description;
        }
        
        // Sync songs
        for (const localSong of localPlaybook.songs) {
          await this.syncSong(dbPlaybook._id, localSong);
        }
        
        await dbPlaybook.save();
      }
      
      // Get fresh data and update local storage
      const freshPlaybooks = await PlaybookModel.find().populate({
        path: 'songs',
        populate: {
          path: 'sections',
          populate: {
            path: 'lines',
            populate: 'chords'
          }
        }
      });
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(freshPlaybooks));
      
      return true;
    } catch (error) {
      console.error('Error syncing with database:', error);
      return false;
    }
  }

  // Helper method to sync song data
  private static async syncSong(playbookId: mongoose.Types.ObjectId, localSong: any): Promise<ISong | null> {
    try {
      let dbSong = await SongModel.findOne({
        $or: [
          { _id: localSong._id },
          { title: localSong.title, key: localSong.key }
        ]
      });
      
      // Create if doesn't exist
      if (!dbSong) {
        dbSong = new SongModel({
          title: localSong.title,
          key: localSong.key,
          sections: [],
        });
        
        // Add to playbook
        await PlaybookModel.findByIdAndUpdate(
          playbookId,
          { $addToSet: { songs: dbSong._id } }
        );
      } else {
        // Update existing
        dbSong.title = localSong.title;
        dbSong.key = localSong.key;
      }
      
      // Sync sections
      if (localSong.sections && Array.isArray(localSong.sections)) {
        for (const localSection of localSong.sections) {
          await this.syncSection(dbSong._id, localSection);
        }
      }
      
      await dbSong.save();
      return dbSong;
    } catch (error) {
      console.error('Error syncing song:', error);
      return null;
    }
  }

  // Helper method to sync section data
  private static async syncSection(songId: mongoose.Types.ObjectId, localSection: any): Promise<void> {
    try {
      let dbSection = await SectionModel.findOne({
        $or: [
          { _id: localSection._id },
          { name: localSection.name, song: songId }
        ]
      });
      
      // Create if doesn't exist
      if (!dbSection) {
        dbSection = new SectionModel({
          name: localSection.name,
          lines: [],
        });
        
        // Add to song
        await SongModel.findByIdAndUpdate(
          songId,
          { $addToSet: { sections: dbSection._id } }
        );
      } else {
        // Update existing
        dbSection.name = localSection.name;
      }
      
      // Sync lines
      if (localSection.lines && Array.isArray(localSection.lines)) {
        for (const localLine of localSection.lines) {
          await this.syncLine(dbSection._id, localLine);
        }
      }
      
      await dbSection.save();
    } catch (error) {
      console.error('Error syncing section:', error);
    }
  }

  // Helper method to sync line data
  private static async syncLine(sectionId: mongoose.Types.ObjectId, localLine: any): Promise<void> {
    try {
      let dbLine = await LineModel.findOne({ _id: localLine._id });
      
      // Create if doesn't exist
      if (!dbLine) {
        dbLine = new LineModel({
          chords: [],
        });
        
        // Add to section
        await SectionModel.findByIdAndUpdate(
          sectionId,
          { $addToSet: { lines: dbLine._id } }
        );
      }
      
      // Sync chords
      if (localLine.chords && Array.isArray(localLine.chords)) {
        for (const localChord of localLine.chords) {
          await this.syncChord(dbLine._id, localChord);
        }
      }
      
      await dbLine.save();
    } catch (error) {
      console.error('Error syncing line:', error);
    }
  }

  // Helper method to sync chord data
  private static async syncChord(lineId: mongoose.Types.ObjectId, localChord: any): Promise<void> {
    try {
      let dbChord = await ChordModel.findOne({ _id: localChord._id });
      
      // Create if doesn't exist
      if (!dbChord) {
        dbChord = new ChordModel({
          root: localChord.root,
          quality: localChord.quality,
          interval: localChord.interval,
          timing: localChord.timing,
          bass: localChord.bass,
        });
        
        // Add to line
        await LineModel.findByIdAndUpdate(
          lineId,
          { $addToSet: { chords: dbChord._id } }
        );
      } else {
        // Update existing
        dbChord.root = localChord.root;
        dbChord.quality = localChord.quality;
        dbChord.interval = localChord.interval;
        dbChord.timing = localChord.timing;
        dbChord.bass = localChord.bass;
      }
      
      await dbChord.save();
    } catch (error) {
      console.error('Error syncing chord:', error);
    }
  }
} 