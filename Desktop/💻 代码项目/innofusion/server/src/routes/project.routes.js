import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/').get(protect, getProjects).post(protect, createProject);
router
  .route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

export default router;
