import { Request, Response } from 'express';
import Playbook, { IPlaybook } from '../models/Playbook';

export const createPlaybook = async (req: Request, res: Response) => {
  try {
    const playbook = new Playbook(req.body);
    await playbook.save();
    res.status(201).json(playbook);
  } catch (error) {
    res.status(400).json({ message: 'Error creating playbook', error });
  }
};

export const getPlaybooks = async (req: Request, res: Response) => {
  try {
    const playbooks = await Playbook.find().populate('songs');
    res.json(playbooks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playbooks', error });
  }
};

export const getPlaybookById = async (req: Request, res: Response) => {
  try {
    const playbook = await Playbook.findById(req.params.id).populate('songs');
    if (!playbook) {
      return res.status(404).json({ message: 'Playbook not found' });
    }
    res.json(playbook);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playbook', error });
  }
};

export const updatePlaybook = async (req: Request, res: Response) => {
  try {
    const playbook = await Playbook.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('songs');
    
    if (!playbook) {
      return res.status(404).json({ message: 'Playbook not found' });
    }
    res.json(playbook);
  } catch (error) {
    res.status(400).json({ message: 'Error updating playbook', error });
  }
};

export const deletePlaybook = async (req: Request, res: Response) => {
  try {
    const playbook = await Playbook.findByIdAndDelete(req.params.id);
    if (!playbook) {
      return res.status(404).json({ message: 'Playbook not found' });
    }
    res.json({ message: 'Playbook deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting playbook', error });
  }
}; 