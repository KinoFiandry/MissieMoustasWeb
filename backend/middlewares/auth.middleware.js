// backend/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET;

// Vérifie JWT et attache user à req.user
export async function authUser(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });
    const payload = jwt.verify(token, secret);
    req.user = await User.findById(payload.id);
    next();
  } catch {
    res.status(401).json({ message: 'Authentification échouée' });
  }
}

// Vérifie que l’utilisateur a le rôle admin
export function authAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès admin requis' });
  }
  next();
}
