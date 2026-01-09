import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller.js';

const router = Router();

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

export default router;
