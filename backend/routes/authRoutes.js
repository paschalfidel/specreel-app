import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Local Auth
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- Google OAuth ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

// --- Facebook OAuth ---
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

export default router;
