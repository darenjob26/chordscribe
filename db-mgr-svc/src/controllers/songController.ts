import { Request, Response } from 'express';
import Song, { ISong } from '../models/Song';

export const createSong = async (req: Request, res: Response) => {
  try {
    const song = new Song(req.body);
    await song.save();
    res.status(201).json(song);
  } catch (error) {
    res.status(400).json({ message: 'Error creating song', error });
  }
};

export const getSongs = async (req: Request, res: Response) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching songs', error });
  }
};

export const getSongById = async (req: Request, res: Response) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching song', error });
  }
};

export const updateSong = async (req: Request, res: Response) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(400).json({ message: 'Error updating song', error });
  }
};

export const deleteSong = async (req: Request, res: Response) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting song', error });
  }
}; 