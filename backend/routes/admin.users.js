// backend/routes/admin.users.js
import express from 'express';
import User from '../models/user.model.js';
import { authUser, authAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authUser, authAdmin);

// GET all users (sans mot de passe ni clé privée)
router.get('/', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// POST new user
router.post('/', async (req, res) => {
  const { username, password, publicKey, role } = req.body;
  const user = new User({ username, password, publicKey, role });
  await user.save();
  res.status(201).json({ id: user._id, username: user.username });
});

// PUT update user (sauf mot de passe)
router.put('/:id', async (req, res) => {
  const updates = { ...req.body };
  delete updates.password;
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  res.json(user);
});

// DELETE user
router.delete('/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
