import { Request, Response } from 'express';
import Playbook, { IPlaybook } from '../models/Playbook';
import Song, { ISong } from '../models/Song';
import { Types } from 'mongoose';

export const getPlaybooks = async (req: Request, res: Response) => {
  try {
    const playbooks = await Playbook.find({ userId: req.params.userId }).populate('songs');
    res.json(playbooks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playbooks', error });
  }
};

export const getPlaybookSongs = async (req: Request, res: Response) => {
  try {
    const playbook = await Playbook.findById({
      userId: req.params.userId,
      _id: req.params.id
    }).populate('songs');
    res.json(playbook?.songs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playbook songs', error });
  }
};

export const getPlaybookById = async (req: Request, res: Response) => {
  try {
    const playbook = await Playbook.findById({
      userId: req.params.userId,
      _id: req.params.id
    }).populate('songs');
    if (!playbook) {
      return res.status(404).json({ message: 'Playbook not found' });
    }
    res.json(playbook);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playbook', error });
  }
};

export const upsertPlaybooks = async (req: Request, res: Response) => {
  try {
    const playbooks: IPlaybook[] = req.body;
    const existingPlaybooks = await Playbook.find({ userId: req.params.userId });
    const existingIds = new Set(existingPlaybooks.map((pb: IPlaybook) => pb._id?.toString()));
    const updatedIds = new Set(playbooks.map((pb: IPlaybook) => pb._id?.toString()));

    // Handle deletions - delete playbooks that are not in the updated list
    const playbooksToDelete = existingPlaybooks.filter((pb: IPlaybook) => !updatedIds.has(pb._id?.toString()));
    await Promise.all(playbooksToDelete.map((pb: IPlaybook) => Playbook.findByIdAndDelete({
      userId: req.params.userId,
      _id: pb._id
    })));

    // Handle updates and inserts
    const upsertPromises = playbooks.map(async (playbook: IPlaybook) => {
      let newSongs: Types.ObjectId[] = [];

      // Handle songs
      for (const song of playbook.songs) {
        const songData = { ...song };
        delete (songData as any)._id;
        const newSong = new Song(songData);
        await newSong.save();
        newSongs.push(new Types.ObjectId(newSong._id));
      }
      playbook.songs = newSongs;

      if (existingIds.has(playbook._id?.toString())) {
        // Update existing playbook
        const updatedPlaybook = await Playbook.findByIdAndUpdate(
          {
            userId: req.params.userId,
            _id: playbook._id
          },
          { ...playbook, syncStatus: 'synced' },
          { new: true, runValidators: true }
        ).populate('songs');
        return updatedPlaybook;
      } else {
        // Create new playbook
        const playbookData = { ...playbook, syncStatus: 'synced' };
        delete (playbookData as any)._id;
        const newPlaybook = new Playbook(playbookData);
        return newPlaybook.save().then(pb => pb.populate('songs'));
      }
    });

    const updatedPlaybooks = await Promise.all(upsertPromises);
    res.json(updatedPlaybooks);
  } catch (error) {
    console.error('Error in upsertPlaybooks:', error);
    res.status(400).json({ message: 'Error upserting playbooks', error });
  }
};

export const upsertPlaybookSongs = async (req: Request, res: Response) => {
  try {
    const { userId, playbookId } = req.params;
    const updatedSongs = req.body;

    // Validate input
    if (!Array.isArray(updatedSongs)) {
      return res.status(400).json({ message: 'Songs must be an array' });
    }

    // Get the playbook to update its songs array
    const playbook = await Playbook.findOne({ _id: playbookId, userId });
    if (!playbook) {
      return res.status(404).json({ message: 'Playbook not found' });
    }

    // Get current songs in the playbook
    const currentSongs = await Song.find({ playbookId });

    // Find songs to delete (those not in updatedSongs)
    const currentSongIds = currentSongs.map(song => song._id.toString());
    const updatedSongIds = updatedSongs.map(song => song._id);
    const songsToDelete = currentSongIds.filter(id => !updatedSongIds.includes(id));

    // Delete songs that are no longer in the playbook
    if (songsToDelete.length > 0) {
      await Song.deleteMany({ _id: { $in: songsToDelete } });
    }

    // Process each song
    const processedSongs = await Promise.all(updatedSongs.map(async (song) => {
      // If it's a new song (has a temporary ID), remove the _id
      if (song._id && typeof song._id === 'string' && !song._id.match(/^[0-9a-fA-F]{24}$/)) {
        const { _id, ...songData } = song;
        const newSong = new Song({
          ...songData,
          userId,
          playbookId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await newSong.save();
        return newSong;
      } else {
        // Update existing song
        const updatedSong = await Song.findByIdAndUpdate(
          song._id,
          {
            ...song,
            userId,
            playbookId,
            updatedAt: new Date()
          },
          { new: true }
        );
        return updatedSong;
      }
    }));

    // Update playbook's songs array with the new IDs
    playbook.songs = processedSongs.map(song => new Types.ObjectId(song!._id));
    playbook.updatedAt = new Date();
    await playbook.save();

    // Return the updated songs
    const finalSongs = await Song.find({ playbookId });
    res.json(finalSongs);
  } catch (error) {
    console.error('Error upserting playbook songs:', error);
    res.status(500).json({ 
      message: 'Error upserting playbook songs', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};