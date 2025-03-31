import express from 'express';
import {
  createPlaybook,
  getPlaybooks,
  getPlaybookById,
  updatePlaybook,
  deletePlaybook,
} from '../controllers/playbookController';

const router = express.Router();

router.post('/', createPlaybook);
router.get('/', getPlaybooks);
router.get('/:id', getPlaybookById);
router.put('/:id', updatePlaybook);
router.delete('/:id', deletePlaybook);

export default router; 