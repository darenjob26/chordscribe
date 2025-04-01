import express from 'express';
import {
  createPlaybook,
  getPlaybooks,
  getPlaybookById,
  updatePlaybook,
  deletePlaybook,
  getPlaybookSongs,
  upsertPlaybooks,
} from '../controllers/playbookController';

const router = express.Router();

router.get('/:userId', getPlaybooks);
router.get('/:userId/:id/songs', getPlaybookSongs);
router.post('/:userId/bulk', upsertPlaybooks);
router.get('/:userId/:id', getPlaybookById);

export default router; 