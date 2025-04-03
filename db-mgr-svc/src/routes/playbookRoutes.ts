import express from 'express';
import {
  getPlaybooks,
  getPlaybookById,
  getPlaybookSongs,
  upsertPlaybooks,
  upsertPlaybookSongs,
} from '../controllers/playbookController';

const router = express.Router();

router.get('/:userId', getPlaybooks);
router.get('/:userId/:id/songs', getPlaybookSongs);
router.post('/:userId/:playbookId/songs', upsertPlaybookSongs);
router.post('/:userId/bulk', upsertPlaybooks);
router.get('/:userId/:id', getPlaybookById);

export default router; 