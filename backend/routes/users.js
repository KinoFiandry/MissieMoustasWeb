// backend/routes/users.js
import express from 'express';
import User from '../models/user.model.js';
import { authUser } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authUser);

// GET /users → liste tous les users sans mot de passe ni publicKey
router.get('/', async (req, res) => {
  const list = await User
    .find()
    .select('_id fullName username')
    .lean();
  // ôte celui en cours
  const others = list.filter(u => u._id.toString() !== req.user._id.toString());
  res.json(others);
});

export default router;
