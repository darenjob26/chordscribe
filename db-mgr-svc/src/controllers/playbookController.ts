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

