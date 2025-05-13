// backend/routes/auth.js
import express from 'express';
import { generateKeyPairSync } from 'crypto';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const secret = process.env.JWT_SECRET;

// Middleware de validation pour /signup
const signupValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Le nom complet est requis')
    .isLength({ min: 2 }).withMessage('Le nom complet doit contenir au moins 2 caractères'),
  body('username')
    .trim()
    .notEmpty().withMessage('Le username est requis')
    .isAlphanumeric().withMessage('Le username doit être alphanumérique')
    .isLength({ min: 3 }).withMessage('Le username doit contenir au moins 3 caractères'),
  body('email')
    .trim()
    .notEmpty().withMessage('L’email est requis')
    .isEmail().withMessage('Format d’email invalide'),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule'),
  body('confirmPassword')
    .notEmpty().withMessage('La confirmation de mot de passe est requise')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Les mots de passe ne correspondent pas'),
];

router.post(
  '/signup',
  signupValidation,
  async (req, res) => {
    console.log('🚀 Requête signup reçue:', req.body);
    // 1. Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Renvoie la première erreur rencontrée
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { fullName, username, email, password } = req.body;

      // 2. Génération de la paire de clés RSA
      const { publicKey, privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding:  { type: 'spki',  format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      // 3. Création et sauvegarde de l'utilisateur
      const user = new User({ fullName, username, email, password, publicKey });
      await user.save();
      console.log('Utilisateur enregistré:', user._id);
      console.log('Données en base:', await User.findById(user._id).lean());
      // 4. Envoi de la privateKey côté client
      res.status(201).json({ userId: user._id, privateKey });

    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        // doublon email ou username
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({ message: `${field} déjà utilisé` });
      }
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

// Middleware de validation pour /login
const loginValidation = [
  body('usernameOrEmail')
    .trim()
    .notEmpty().withMessage('Le username ou l’email est requis'),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
];

router.post(
  '/login',
  loginValidation,
  async (req, res) => {
    // 1. Validation des champs de login
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { usernameOrEmail, password } = req.body;
    const identifier = usernameOrEmail.trim().toLowerCase();
    console.log('LOGIN payload:', req.body);

    try {
      // 2. Recherche de l'utilisateur par email ou username
      const user = await User.findOne({
        $or: [
        { username: identifier },
        { email:    identifier }
      ]
      });
    console.log('User found:', user ? user._id : null);
      if (!user) {
      // On renvoie un 401 avant d'appeler comparePassword
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // comparePassword existe toujours ici
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

      // 3. Génération du JWT
      const token = jwt.sign({ id: user._id, role: user.role }, secret, {
        expiresIn: '12h'
      });
      res.json({ token, userId: user._id, role: user.role });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

export default router;
