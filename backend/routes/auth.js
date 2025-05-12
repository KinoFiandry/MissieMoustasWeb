// backend/routes/auth.js
import express from 'express';
import { generateKeyPairSync } from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const secret = process.env.JWT_SECRET;

// Inscription : génère paire RSA, enregistre user + clé publique
router.post('/signup', async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
      confirmPassword
    } = req.body;
    // Affichez pour debug :
    console.log('Signup payload:', req.body);
    // 1. Champs obligatoires
    if (!fullName || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    // 2. Mots de passe identiques
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }
    // 3. Génération clé RSA + enregistrement
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding:  { type: 'spki',  format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const user = new User({
      fullName,
      username,
      email,
      password,
      publicKey
    });
    await user.save();
    // 4. Retourne la privateKey pour le client
    res.status(201).json({ userId: user._id, privateKey });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ message: `${field} déjà utilisé` });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Connexion : compare mot de passe, renvoie JWT
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  console.log('LOGIN payload:', req.body);
  const user = await User.findOne({
    $or: [
      { username: usernameOrEmail },
      { email:    usernameOrEmail }
    ]
   });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }
  const token = jwt.sign({ id: user._id }, secret, { expiresIn: '12h' });
  res.json({ token, userId: user._id, role: user.role });
});

export default router;
