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
import { connectToDatabase, isConnectedToDatabase } from '../database';
import mongoose from 'mongoose';

// Service for Playbook operations
export class PlaybookService {
  // Get all playbooks with populated data
  static async getAllPlaybooks(): Promise<IPlaybook[]> {
    try {
      // Ensure connection to MongoDB
      if (!isConnectedToDatabase()) {
        await connectToDatabase();
      }
      
      // Get all playbooks with populated relationships
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
      
      return playbooks;
    } catch (error) {
      console.error('Error getting playbooks:', error);
      return [];
    }
  }

  // Get playbook by ID
  static async getPlaybookById(id: string): Promise<IPlaybook | null> {
    try {
      // Ensure connection to MongoDB
      if (!isConnectedToDatabase()) {
        await connectToDatabase();
      }
      
      // Find playbook by ID with populated relationships
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
    } catch (error) {
      console.error(`Error getting playbook with ID ${id}:`, error);
      return null;
    }
  }

  // Create a new playbook
  static async createPlaybook(data: Partial<IPlaybook>): Promise<IPlaybook> {
    try {
      // Ensure connection to MongoDB
      await connectToDatabase();
      
      // Create a new playbook
      const playbook = new PlaybookModel({
        name: data.name || 'New Playbook',
        description: data.description || '',
        songs: []
      });
      
      // Save the playbook
      await playbook.save();
      
      return playbook;
    } catch (error) {
      console.error('Error creating playbook:', error);
      throw error;
    }
  }

  // Update a playbook
  static async updatePlaybook(id: string, data: Partial<IPlaybook>): Promise<IPlaybook | null> {
    try {
      // Ensure connection to MongoDB
      if (!isConnectedToDatabase()) {
        await connectToDatabase();
      }
      
      // Update playbook by ID
      const playbook = await PlaybookModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true } // Return the updated document
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
      
      return playbook;
    } catch (error) {
      console.error(`Error updating playbook with ID ${id}:`, error);
      return null;
    }
  }

  // Delete a playbook
  static async deletePlaybook(id: string): Promise<boolean> {
    try {
      // Ensure connection to MongoDB
      if (!isConnectedToDatabase()) {
        await connectToDatabase();
      }
      
      // Delete playbook by ID
      const result = await PlaybookModel.findByIdAndDelete(id);
      
      return !!result;
    } catch (error) {
      console.error(`Error deleting playbook with ID ${id}:`, error);
      return false;
    }
  }

  // Add song to playbook
  static async addSongToPlaybook(playbookId: string, songData: Partial<ISong>): Promise<IPlaybook | null> {
    try {
      // Ensure connection to MongoDB
      if (!isConnectedToDatabase()) {
        await connectToDatabase();
      }
      
      // Create song and related documents
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
      
      return playbook;
    } catch (error) {
      console.error(`Error adding song to playbook with ID ${playbookId}:`, error);
      return null;
    }
  }

  // Helper method to create song with all relations
  private static async createSongWithRelations(songData: Partial<ISong>): Promise<ISong> {
    // Create the song first
    const song = new SongModel({
      title: songData.title || 'New Song',
      key: songData.key || 'C',
      sections: [],
    });
    
    // Create sections if provided
    if (songData.sections && Array.isArray(songData.sections)) {
      for (const sectionData of songData.sections as (ISection & { name: string, lines: any[] })[]) {
        const section = new SectionModel({
          name: sectionData.name || 'Section',
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
                  root: chordData.root || 'C',
                  quality: chordData.quality || '',
                  interval: chordData.interval || '',
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
      // Ensure connection to MongoDB
      if (!isConnectedToDatabase()) {
        await connectToDatabase();
      }
      
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
      
      return playbook;
    } catch (error) {
      console.error(`Error updating song ${songId} in playbook ${playbookId}:`, error);
      return null;
    }
  }

  // Delete song from playbook
  static async deleteSongFromPlaybook(playbookId: string, songId: string): Promise<IPlaybook | null> {
    try {
      // Ensure connection to MongoDB
      if (!isConnectedToDatabase()) {
        await connectToDatabase();
      }
      
      // Remove song reference from playbook
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
      
      // Delete the song and all related documents
      await this.deleteSongAndRelations(songId);
      
      return playbook;
    } catch (error) {
      console.error(`Error deleting song ${songId} from playbook ${playbookId}:`, error);
      return null;
    }
  }
  
  // Helper method to delete a song and all its related documents
  private static async deleteSongAndRelations(songId: string): Promise<void> {
    try {
      // Find the song first
      const song = await SongModel.findById(songId);
      if (!song) return;
      
      // Get section IDs
      const sectionIds: mongoose.Types.ObjectId[] = [];
      song.sections.forEach((sectionId) => {
        if (sectionId) {
          sectionIds.push(sectionId as mongoose.Types.ObjectId);
        }
      });
      
      // Find all sections 
      const sections = await SectionModel.find({ _id: { $in: sectionIds } });
      
      // Get all line IDs from sections
      const lineIds: mongoose.Types.ObjectId[] = [];
      sections.forEach(section => {
        if (section.lines && section.lines.length) {
          section.lines.forEach((lineId) => {
            if (lineId) {
              lineIds.push(lineId as mongoose.Types.ObjectId);
            }
          });
        }
      });
      
      // Find all lines
      const lines = await LineModel.find({ _id: { $in: lineIds } });
      
      // Get all chord IDs from lines
      const chordIds: mongoose.Types.ObjectId[] = [];
      lines.forEach(line => {
        if (line.chords && line.chords.length) {
          line.chords.forEach((chordId) => {
            if (chordId) {
              chordIds.push(chordId as mongoose.Types.ObjectId);
            }
          });
        }
      });
      
      // Delete in reverse order
      await ChordModel.deleteMany({ _id: { $in: chordIds } });
      await LineModel.deleteMany({ _id: { $in: lineIds } });
      await SectionModel.deleteMany({ _id: { $in: sectionIds } });
      await SongModel.deleteOne({ _id: songId });
      
    } catch (error) {
      console.error(`Error deleting song and relations for song ${songId}:`, error);
    }
  }
} 